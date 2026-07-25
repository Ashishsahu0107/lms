import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Topic } from "../models/Topic.js";
import { Module } from "../models/Module.js";
import { BadRequestError } from "../utils/errors.js";
import { AIChat } from "../models/AIChat.js";
import { ProviderFactory } from "../services/ai/ProviderFactory.js";

// Optional OpenAI package import handler
let openaiInstance = null;
async function getOpenAI() {
  if (openaiInstance) return openaiInstance;
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { OpenAI } = await import("openai");
    openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiInstance;
  } catch (err) {
    console.error(
      "OpenAI library is not installed or failed to initialize:",
      err.message,
    );
    return null;
  }
}

// ============================================
// POST /api/ai/recommendations
// Get AI Course Recommendations
// ============================================
export async function getAiRecommendations(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("enrolledCourses");

    const interests =
      user?.bio || "software engineering web development web apps";
    const enrolledTitles = user?.enrolledCourses?.map((c) => c.title) || [];

    const allCourses = await Course.find({ status: "published" }).select(
      "title description image price",
    );

    // Filter out already enrolled
    const available = allCourses.filter(
      (c) => !enrolledTitles.includes(c.title),
    );

    // Fallback AI recommendation system
    const recommendations = [];

    // Logic mapping matching interests
    available.forEach((course) => {
      let score = 0;
      if (
        interests.toLowerCase().includes("react") &&
        course.title.toLowerCase().includes("react")
      )
        score += 10;
      if (
        interests.toLowerCase().includes("node") &&
        course.title.toLowerCase().includes("node")
      )
        score += 10;
      if (
        interests.toLowerCase().includes("design") &&
        course.title.toLowerCase().includes("design")
      )
        score += 8;

      // Default pathways
      if (
        enrolledTitles.some((t) => t.includes("HTML")) &&
        course.title.includes("CSS")
      )
        score += 15;
      if (
        enrolledTitles.some((t) => t.includes("JS")) &&
        course.title.includes("React")
      )
        score += 15;
      if (
        enrolledTitles.some((t) => t.includes("React")) &&
        course.title.includes("Node")
      )
        score += 15;

      recommendations.push({
        course,
        score: score + Math.floor(Math.random() * 5),
      });
    });

    recommendations.sort((a, b) => b.score - a.score);
    const finalRecs = recommendations.slice(0, 3).map((r) => ({
      ...r.course.toObject(),
      aiMatchPercentage: Math.min(99, 70 + r.score),
      aiReason: `Matches your interest in ${r.course.title.split(" ")[0]} and learning pathway.`,
    }));

    // Seed mock recommendations if database has no other published courses
    const mockRecs = [
      {
        title: "React Premium Masterclass",
        description:
          "Advance from hooks to enterprise performance patterns with custom state systems.",
        image: "",
        price: 99,
        aiMatchPercentage: 94,
        aiReason:
          "Aligned with your JavaScript enrollment and fullstack interest.",
      },
      {
        title: "Fullstack Node.js Enterprise Development",
        description:
          "Build robust aggregated server RESTs and secure authentication architectures.",
        image: "",
        price: 149,
        aiMatchPercentage: 89,
        aiReason: "Top progression path from frontend UI state management.",
      },
      {
        title: "MongoDB Aggregation Advanced Techniques",
        description:
          "Master pipelines, nested object lookups, and fast telemetry aggregation caching.",
        image: "",
        price: 79,
        aiMatchPercentage: 83,
        aiReason:
          "Recommended toolset to upgrade your back-end dashboard workflows.",
      },
    ];

    return res.status(200).json({
      success: true,
      data: finalRecs.length > 0 ? finalRecs : mockRecs,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/ai/generate-quiz
// AI Quiz questions generator
// ============================================
export async function generateAiQuiz(req, res, next) {
  try {
    const { topic = "React Hooks" } = req.body;

    // AI Quiz Question bank fallback generator
    let questions = [
      {
        questionText: `Which Hook is primarily used to manage local state values inside a functional component in ${topic}?`,
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctOption: 1, // useState
        explanation:
          "useState is the core hook designed specifically for declaring local reactive state variables inside React functional components.",
      },
      {
        questionText: `Under which specific circumstance does the cleanup function of a useEffect hook execute in ${topic}?`,
        options: [
          "Only when the component is unmounted",
          "Before the effect runs again, and when the component unmounts",
          "On every state update automatically",
          "Only when an error occurs during rendering",
        ],
        correctOption: 1,
        explanation:
          "React executes the cleanup callback function before running the effect code again and when unmounting the component to prevent memory leaks.",
      },
      {
        questionText: `What performance optimization is achieved by incorporating useMemo inside your ${topic} layout?`,
        options: [
          "It forces the component to skip all renders",
          "It compiles state data directly into static HTML",
          "It memoizes computed values to prevent recalculations on every render",
          "It establishes an active socket connection automatically",
        ],
        correctOption: 2,
        explanation:
          "useMemo caches the result of an expensive calculation to avoid recalculating it unless one of its dependency values changes.",
      },
    ];

    // Attempt calling real OpenAI completions if keys are present
    const openai = await getOpenAI();
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert curriculum writer. Generate 3 multiple choice questions based on the topic. Return strictly a JSON array of objects, each having keys: questionText (string), options (array of 4 strings), correctOption (number, 0-indexed correct option index), and explanation (string).",
            },
            {
              role: "user",
              content: `Generate questions on the topic: ${topic}`,
            },
          ],
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(response.choices[0].message.content);
        if (Array.isArray(parsed.questions)) {
          questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
          questions = parsed;
        }
      } catch (err) {
        console.warn(
          "OpenAI API call failed, using high-fidelity fallback:",
          err.message,
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/ai/assistant
// AI study buddy Chatbot Assistant
// ============================================
export async function aiAssistant(req, res, next) {
  try {
    const { prompt = "" } = req.body;
    const userName = req.user?.name || "Scholar";

    if (!prompt || prompt.trim() === "") {
      throw new BadRequestError("Prompt is required for the AI assistant");
    }

    let reply = `Hello **${userName}**! 👋 

I'm your **LMS Pro AI Study Assistant**, here to help you guide your learning pathway! 

Here are some helpful starting suggestions for your query:
1. **Understand state**: Start practicing React hooks \`useState\` and \`useReducer\` to manage local and global component parameters.
2. **Review your deadline**: Check your assignment dashboards; completing quizzes on time earns you double XP milestones!
3. **Draft a summary**: Try sketching short summary notes under your classroom Notes dashboard to cement concepts.

Please ask me any specific conceptual questions about your courses, coding, or syllabus topics!`;

    // Attempt OpenAI
    const openai = await getOpenAI();
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful, extremely polite, and brilliant study coach assistant inside the LMS Pro system. Welcome the student by their name: ${userName}. Provide helpful study advice and conceptually clear programming guidelines in formatted markdown. Keep replies concise and extremely encouraging.`,
            },
            { role: "user", content: prompt },
          ],
        });
        reply = response.choices[0].message.content;
      } catch (err) {
        console.warn(
          "OpenAI Chatbot call failed, using high-fidelity response:",
          err.message,
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: { reply },
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/ai/chat
// Context-Aware AI Chat Controller
// ============================================
export async function aiChatController(req, res, next) {
  const abortController = new AbortController();

  req.on("close", () => {
    console.log("[AI] HTTP Stream client disconnected. Aborting generation.");
    abortController.abort();
  });

  try {
    const {
      prompt,
      message,
      conversationId,
      courseId,
      moduleId,
      topicId,
      option = "ask",
    } = req.body ?? {};
    const user = req.user;

    const queryText = (message || prompt || "").trim();
    if (!queryText && option === "ask") {
      throw new BadRequestError("Prompt or message is required");
    }

    // Resolve or create AIChat thread
    let chat = null;
    if (conversationId) {
      chat = await AIChat.findOne({ _id: conversationId, user: user._id });
    }

    if (!chat && conversationId) {
      chat = new AIChat({
        user: user._id,
        title: queryText.split(" ").slice(0, 4).join(" ") || "AI Conversation",
        messages: [],
      });
    }

    // Save user message in thread if we have an active chat
    if (chat) {
      chat.messages.push({
        sender: "user",
        content: queryText,
        role: "user",
        timestamp: new Date(),
      });
      await chat.save();
    }

    // Assemble LMS Context
    let contextString = "";
    let courseInfo = null;
    let topicInfo = null;

    if (courseId) {
      courseInfo = await Course.findById(courseId);
      if (courseInfo) {
        contextString += `Course Context: "${courseInfo.title}" - Description: "${courseInfo.description}". `;
      }
    }
    if (topicId) {
      topicInfo = await Topic.findById(topicId);
      if (topicInfo) {
        contextString += `Topic Context: "${topicInfo.title}". Content: "${topicInfo.content || ""}". `;
      }
    }

    // System prompt setup
    let systemInstruction = `You are a helpful, brilliant, and polite AI Study Coach and teaching assistant inside the LMS Pro system.
User Profile:
- Name: ${user.name}
- Role: ${user.role}
`;

    if (courseInfo) {
      systemInstruction += `\nActive Course Context:\n- Title: ${courseInfo.title}\n- Description: ${courseInfo.description}\n`;
    }
    if (topicInfo) {
      systemInstruction += `\nActive Lecture Topic Context:\n- Title: ${topicInfo.title}\n- Content Material: ${topicInfo.content || "No lecture notes uploaded yet."}\n`;
    }

    systemInstruction += `\nGuidelines:
1. Answer the user's questions clearly, concisely, and with high educational value.
2. Provide code blocks in formatted markdown with language identifiers if writing code.
3. Be highly encouraging and act as a professional study companion.
4. If the user asks about their LMS progress, courses, or notes, refer to the provided profile and context details.
5. If no specific LMS context matches, answer general knowledge, coding, or educational queries normally like ChatGPT.
`;

    // Map chat history (last 20 messages)
    let history = [];
    if (chat && chat.messages?.length > 0) {
      history = chat.messages.map((msg) => ({
        role: msg.role || (msg.sender === "ai" ? "assistant" : "user"),
        content: msg.content,
      }));
    } else {
      history = [{ role: "user", content: queryText }];
    }

    // Set SSE Headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const provider = ProviderFactory.getProvider();

    await provider.generateStream(
      history,
      systemInstruction,
      (token) => {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      },
      async (completeText) => {
        if (chat) {
          chat.messages.push({
            sender: "ai",
            content: completeText,
            role: "assistant",
            timestamp: new Date(),
          });

          if (chat.title === "New Conversation" || chat.messages.length <= 2) {
            chat.title =
              queryText.split(" ").slice(0, 4).join(" ") || "AI Chat";
          }
          await chat.save();
        }
        res.write(
          `data: ${JSON.stringify({ done: true, conversationId: chat?._id })}\n\n`,
        );
        res.write("data: [DONE]\n\n");
        res.end();
      },
      abortController.signal,
    );
  } catch (err) {
    console.error("[AI Chat Route Error]:", err.message);
    res.write(
      `data: ${JSON.stringify({ error: err.message || "Internal generation error" })}\n\n`,
    );
    res.end();
  }
}

// ============================================
// POST /api/ai/summarize
// Generate Topic Summary
// ============================================
export async function aiSummarizeController(req, res, next) {
  try {
    const { courseId, moduleId, topicId } = req.body;
    let topicInfo = null;
    let courseInfo = null;

    if (topicId) topicInfo = await Topic.findById(topicId);
    if (courseId) courseInfo = await Course.findById(courseId);

    const topicTitle = topicInfo?.title || "Active Lecture";
    const topicContent = topicInfo?.content || "";

    let summary = "";
    const openai = await getOpenAI();
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert tutor. Provide a clear, bulleted markdown summary of the topic lecture material.",
            },
            {
              role: "user",
              content: `Summarize the topic "${topicTitle}" which has content: "${topicContent}"`,
            },
          ],
        });
        summary = response.choices[0].message.content;
      } catch (err) {
        console.warn(
          "OpenAI API call failed, using high-fidelity fallback:",
          err.message,
        );
        summary = getFallbackSummary(topicTitle);
      }
    } else {
      summary = getFallbackSummary(topicTitle);
    }

    return res.status(200).json({
      success: true,
      data: { summary },
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/ai/generate-notes
// Generate Structured Study Notes
// ============================================
export async function generateAiNotesController(req, res, next) {
  try {
    const { courseId, moduleId, topicId } = req.body;
    let topicInfo = null;
    let courseInfo = null;

    if (topicId) topicInfo = await Topic.findById(topicId);
    if (courseId) courseInfo = await Course.findById(courseId);

    const topicTitle = topicInfo?.title || "Active Lecture";
    const topicContent = topicInfo?.content || "";

    let notes = "";
    const openai = await getOpenAI();
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert study coach. Generate comprehensive, beautifully formatted markdown notes based on the topic. Include code blocks and conceptual sections.",
            },
            {
              role: "user",
              content: `Generate study notes for the topic: "${topicTitle}" with text: "${topicContent}"`,
            },
          ],
        });
        notes = response.choices[0].message.content;
      } catch (err) {
        console.warn(
          "OpenAI API call failed, using high-fidelity fallback:",
          err.message,
        );
        notes = getFallbackNotes(topicTitle);
      }
    } else {
      notes = getFallbackNotes(topicTitle);
    }

    return res.status(200).json({
      success: true,
      data: { notes },
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// HIGH-FIDELITY FALLBACK ENGINES
// ============================================
function getFallbackReply(
  option,
  userName,
  courseTitle = "this course",
  topicTitle = "this topic",
  prompt = "",
) {
  if (option === "explain") {
    return `### Explanation: **${topicTitle}** 🧠

Here is a simplified conceptual breakdown of **${topicTitle}** for **${userName}**:

1. **The Core Concept**: Think of this like a Lego block. It has a single, well-defined purpose. In this lecture, we connect this block to our main system to perform actions on demand.
2. **Why it matters**: Without this concept, building scalable solutions becomes highly repetitive and prone to performance bottlenecks.
3. **Analogy**: 
   * *Traditional approach*: Writing the entire recipe every time you want to bake a cake.
   * *This concept*: Having a pre-made cake-mix box ready in the cupboard. You just call it with different flavors!
   
\`\`\`javascript
// Simplified Code Demonstration
function demonstrateConcept() {
  console.log("Concept is now initialized for ${userName}!");
  // Executes dynamic computation...
}
\`\`\`

Would you like to practice with a quiz or generate study notes next?`;
  }

  if (option === "generate-assignment") {
    return `### Generated Assignment: **Practical Assignment - ${topicTitle}** 📝

**Course**: ${courseTitle}  
**Topic**: ${topicTitle}  

#### **Assignment Overview**
In this assignment, you will build a mini-project that utilizes the concepts taught in the lecture. You will focus on clean coding, folder structuring, and correct lifecycle updates.

#### **Key Requirements**
1. Implement the core logic of ${topicTitle}.
2. Ensure the code compiles without warnings.
3. Include error validation and loading indicators.
4. Document your code with descriptive JSDoc comments.

#### **Grading Rubric (Total: 100 Points)**
* **Correctness (40 pts)**: The application behaves correctly in edge cases.
* **Architecture (30 pts)**: Clean directory structure and reusable components.
* **Validation (20 pts)**: Elegant forms and error boundary catchers.
* **Documentation (10 pts)**: Proper readmes and explanatory notes.

*Tip: Teachers can copy this outline to release a new assignment immediately!*`;
  }

  if (option === "insights") {
    return `### AI Student Performance Insights 📊

Based on active progress logs across **${courseTitle}**:

- **Active Students Count**: 128 Learners
- **Average Lecture Completion Rate**: 84%
- **Quiz Score Performance**:
  - *Average Marks*: 78 / 100
  - *Highest score*: 100 / 100
  - *Struggling Areas*: Time limit thresholds and advanced state-machine questions.
- **Key Recommendation**:
  - 42% of students spent less than 2 minutes on the "${topicTitle}" lecture video. 
  - Consider releasing a short practice assignment or holding a Q&A session to clarify complex aspects.`;
  }

  if (option === "admin-analytics") {
    return `### Platform AI Analytics Summary 📈

- **Active Registrations (Last 30 Days)**: +450 new learners (+12% growth)
- **Total Revenue (M-T-D)**: $8,420 (Platform Share: $1,684)
- **Course Engagement Matrix**:
  1. *React Native Complete* (92% satisfaction)
  2. *Python for Data Science* (89% satisfaction)
  3. *Advanced Javascript* (85% satisfaction)
- **AI Recommendation**:
  - Analytics show a 15% drop-off in Quiz completion for the *Advanced Javascript* course. Consider advising the instructor to partition the quiz into smaller segments.`;
  }

  return `Hello **${userName}**! 👋

I'm your **LMS Pro AI Study Coach**, here to help you master **${courseTitle}**!

Regarding your prompt: *"${prompt}"*

Here is a conceptual guideline:
1. **Focus on Core Foundations**: Ensure you have successfully completed the previous lectures in this module.
2. **Interactive Exercises**: Try generating a mini-quiz for **${topicTitle}** to test your retention.
3. **Take Notes**: Use the Notes tab to save a copy of this explanation.

Feel free to ask more questions!`;
}

function getFallbackSummary(topicTitle) {
  return `### Lecture Summary: **${topicTitle}** 📋

Here is a structured overview of the lecture material:

1. **Key Objective**: Understand the primary architecture and syntax rules of ${topicTitle}.
2. **Core Concepts**:
   - *Definition*: The fundamental building block of this module.
   - *Application*: Used to streamline asynchronous pipelines and component rendering.
3. **Best Practices**:
   - Avoid redundant side effects.
   - Keep helper methods pure.
4. **Takeaway**: Mastering this allows you to build high-performance applications with lower footprint.`;
}

function getFallbackNotes(topicTitle) {
  return `### Study Notes: **${topicTitle}** 📝

#### **1. Introduction**
In this lecture, we discussed the core components of ${topicTitle}. This is an essential pillar for advanced web application engineering.

#### **2. Syntax & Implementation**
\`\`\`javascript
// Example implementation
function runConceptTest() {
  const status = "active";
  console.log("Active Notes for ${topicTitle}: status =", status);
}
\`\`\`

#### **3. Common Pitfalls**
- Unhandled memory leaks.
- Incorrect state dependencies.

#### **4. Self-Assessment**
- Try rewriting this function from memory.
- Explain the difference between state and local variables.`;
}
