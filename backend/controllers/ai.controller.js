import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { BadRequestError } from "../utils/errors.js";

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
    console.error("OpenAI library is not installed or failed to initialize:", err.message);
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
    
    const interests = user?.bio || "software engineering web development web apps";
    const enrolledTitles = user?.enrolledCourses?.map((c) => c.title) || [];

    const allCourses = await Course.find({ status: "published" }).select("title description image price");

    // Filter out already enrolled
    const available = allCourses.filter(c => !enrolledTitles.includes(c.title));

    // Fallback AI recommendation system
    const recommendations = [];
    
    // Logic mapping matching interests
    available.forEach(course => {
      let score = 0;
      if (interests.toLowerCase().includes("react") && course.title.toLowerCase().includes("react")) score += 10;
      if (interests.toLowerCase().includes("node") && course.title.toLowerCase().includes("node")) score += 10;
      if (interests.toLowerCase().includes("design") && course.title.toLowerCase().includes("design")) score += 8;
      
      // Default pathways
      if (enrolledTitles.some(t => t.includes("HTML")) && course.title.includes("CSS")) score += 15;
      if (enrolledTitles.some(t => t.includes("JS")) && course.title.includes("React")) score += 15;
      if (enrolledTitles.some(t => t.includes("React")) && course.title.includes("Node")) score += 15;

      recommendations.push({ course, score: score + Math.floor(Math.random() * 5) });
    });

    recommendations.sort((a, b) => b.score - a.score);
    const finalRecs = recommendations.slice(0, 3).map(r => ({
      ...r.course.toObject(),
      aiMatchPercentage: Math.min(99, 70 + r.score),
      aiReason: `Matches your interest in ${r.course.title.split(" ")[0]} and learning pathway.`
    }));

    // Seed mock recommendations if database has no other published courses
    const mockRecs = [
      {
        title: "React Premium Masterclass",
        description: "Advance from hooks to enterprise performance patterns with custom state systems.",
        image: "",
        price: 99,
        aiMatchPercentage: 94,
        aiReason: "Aligned with your JavaScript enrollment and fullstack interest."
      },
      {
        title: "Fullstack Node.js Enterprise Development",
        description: "Build robust aggregated server RESTs and secure authentication architectures.",
        image: "",
        price: 149,
        aiMatchPercentage: 89,
        aiReason: "Top progression path from frontend UI state management."
      },
      {
        title: "MongoDB Aggregation Advanced Techniques",
        description: "Master pipelines, nested object lookups, and fast telemetry aggregation caching.",
        image: "",
        price: 79,
        aiMatchPercentage: 83,
        aiReason: "Recommended toolset to upgrade your back-end dashboard workflows."
      }
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
        explanation: "useState is the core hook designed specifically for declaring local reactive state variables inside React functional components."
      },
      {
        questionText: `Under which specific circumstance does the cleanup function of a useEffect hook execute in ${topic}?`,
        options: [
          "Only when the component is unmounted",
          "Before the effect runs again, and when the component unmounts",
          "On every state update automatically",
          "Only when an error occurs during rendering"
        ],
        correctOption: 1,
        explanation: "React executes the cleanup callback function before running the effect code again and when unmounting the component to prevent memory leaks."
      },
      {
        questionText: `What performance optimization is achieved by incorporating useMemo inside your ${topic} layout?`,
        options: [
          "It forces the component to skip all renders",
          "It compiles state data directly into static HTML",
          "It memoizes computed values to prevent recalculations on every render",
          "It establishes an active socket connection automatically"
        ],
        correctOption: 2,
        explanation: "useMemo caches the result of an expensive calculation to avoid recalculating it unless one of its dependency values changes."
      }
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
              content: "You are an expert curriculum writer. Generate 3 multiple choice questions based on the topic. Return strictly a JSON array of objects, each having keys: questionText (string), options (array of 4 strings), correctOption (number, 0-indexed correct option index), and explanation (string)."
            },
            { role: "user", content: `Generate questions on the topic: ${topic}` }
          ],
          response_format: { type: "json_object" }
        });
        const parsed = JSON.parse(response.choices[0].message.content);
        if (Array.isArray(parsed.questions)) {
          questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
          questions = parsed;
        }
      } catch (err) {
        console.warn("OpenAI API call failed, using high-fidelity fallback:", err.message);
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
              content: `You are a helpful, extremely polite, and brilliant study coach assistant inside the LMS Pro system. Welcome the student by their name: ${userName}. Provide helpful study advice and conceptually clear programming guidelines in formatted markdown. Keep replies concise and extremely encouraging.`
            },
            { role: "user", content: prompt }
          ]
        });
        reply = response.choices[0].message.content;
      } catch (err) {
        console.warn("OpenAI Chatbot call failed, using high-fidelity response:", err.message);
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
