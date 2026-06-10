import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { ProviderFactory } from "./ai/ProviderFactory.js";

let openaiInstance = null;
async function getOpenAI() {
  if (openaiInstance) return openaiInstance;
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { OpenAI } = await import("openai");
    openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiInstance;
  } catch (err) {
    console.error("OpenAI library failed to load:", err.message);
    return null;
  }
}

// Generate a helpful simulated coaching response for fallback mode
function getSimulatedCoachReply(prompt, userName) {
  const p = prompt.toLowerCase();
  
  if (p.includes("react") || p.includes("hook") || p.includes("state")) {
    return `Hello **${userName}**! ⚛️ Let's dive into **React Hooks & State Management**!

In React, **State** represents a component's local memory. To work with state, we use hooks inside functional components:

1. **useState**: Perfect for managing single variables.
   \`\`\`javascript
   const [count, setCount] = useState(0);
   \`\`\`
2. **useReducer**: Great for complex state machines or nested states where transition logic is clean.
3. **useEffect**: Tracks changes and runs side-effects (e.g. fetching API data). Make sure to define dependency arrays correctly!

> [!TIP]
> Keep your state minimal and derive values during render rather than syncing duplicate states!

What specific React component are you building? Tell me, and we can draft the code together!`;
  }

  if (p.includes("mongodb") || p.includes("db") || p.includes("aggregate") || p.includes("schema")) {
    return `Hello **${userName}**! 🍃 Let's talk about **MongoDB & Aggregations**!

MongoDB is a document-oriented database. Unlike SQL, it utilizes flexible schemas. When running advanced analytics, we use **Aggregation Pipelines**:

- **$match**: Filters documents (similar to a WHERE clause).
- **$group**: Groups documents together and performs computations (e.g. $sum, $avg).
- **$lookup**: Performs left outer joins to combine documents from another collection.

Here is a quick pipeline outline:
\`\`\`javascript
const stats = await Enrollment.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$course", totalStudents: { $sum: 1 } } }
]);
\`\`\`

Are you optimizing a specific database query? Share your MongoDB schema and I'll write the aggregate pipeline for you!`;
  }

  if (p.includes("schedule") || p.includes("calendar") || p.includes("time") || p.includes("class")) {
    return `Hello **${userName}**! 📅 Looking at your **Timetable & Timelines**:

Your LMS Timetable synchronizes your quizzes, assignment deadlines, and live classrooms:
- **Daily Check-ins**: Log in daily to maintain your XP streak.
- **Classes**: Join glowing live Zoom video classes directly from the dashboard countdown timer.
- **Deadlines**: Assignments approaching their limits are highlighted in red to ensure you never miss credit!

Would you like tips on organizing a daily study schedule to secure high-tier achievements?`;
  }

  if (p.includes("streak") || p.includes("xp") || p.includes("leaderboard") || p.includes("badge") || p.includes("award")) {
    return `Hello **${userName}**! 🏆 Let's check your **Gamification Status**:

You can rapidly climb the class leaderboards by accumulating **XP points**:
1. **Daily Logins**: +10 XP (adds +1 to your active fire streak).
2. **MCQ Quizzes**: +50 XP on completion.
3. **Task Submissions**: +30 XP.
4. **Course Mastery (100%)**: +150 XP and a shiny course completion badge!

> [!IMPORTANT]
> Maintaining your daily streak multiplier is key to securing the *Ultimate Scholar* badge. Keep logging in!

Want to know your current ranking or how to unlock specific badges? Ask me!`;
  }

  if (p.includes("notes") || p.includes("upload") || p.includes("summary")) {
    return `Hello **${userName}**! 📝 Let's talk about **Notes Management**:

The Notes Hub allows teachers to upload lecture summaries and PDFs:
- **Students**: Download lecture slides and summaries, and take custom workspace notes right in the side panel.
- **Teachers**: Write and edit HTML note outlines and associate PDF study guides directly with specific chapters.

Do you need help drafting a summary note or organizing your study files?`;
  }

  return `Hello **${userName}**! 👋 I'm your **LMS Pro AI Study Buddy**.

I can assist you with all aspects of your learning journey:
- **Concept coaching**: Write any programming, database, or UI design question.
- **LMS Navigation**: Ask me how to join Zoom classes, track attendances, upload notes, or download certificates.
- **Quiz Prep**: Ask me to test your knowledge on a specific topic!

What topic would you like to master today? Let's start learning!`;
}

// Streams tokens/words using the active AI Provider or fallback simulator
export async function streamAIResponse(chat, user, onWord, onComplete, signal) {
  const userName = user?.name || "Scholar";

  // System prompt setup
  const systemInstruction = `You are a helpful, brilliant, and polite AI Study Coach and teaching assistant inside the LMS Pro system.
User Profile:
- Name: ${userName}
- Role: ${user?.role || "student"}

Guidelines:
1. Answer the user's questions clearly, concisely, and with high educational value.
2. Provide code blocks in formatted markdown with language identifiers if writing code.
3. Be highly encouraging and act as a professional study companion.
4. If no specific LMS context matches, answer general knowledge, coding, or educational queries normally like ChatGPT.
`;

  // Map last 20 messages
  let history = [];
  if (chat && chat.messages?.length > 0) {
    history = chat.messages.slice(-20).map((msg) => ({
      role: msg.role || (msg.sender === "ai" ? "assistant" : "user"),
      content: msg.content,
    }));
  } else {
    // Fallback if no history was saved
    history = [{ role: "user", content: "Hello" }];
  }

  try {
    const provider = ProviderFactory.getProvider();
    await provider.generateStream(
      history,
      systemInstruction,
      (token) => onWord(token),
      (completeText) => onComplete(completeText),
      signal
    );
  } catch (err) {
    console.error("[AI Chat Stream Error]:", err.message);
    onWord(`\n*(Generation error: ${err.message || "Unable to contact provider"})*`);
    onComplete(`*(Generation error: ${err.message})*`);
  }
}
