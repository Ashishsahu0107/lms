import { OpenAIProvider } from "./OpenAIProvider.js";
import { GeminiProvider } from "./GeminiProvider.js";
import { ClaudeProvider } from "./ClaudeProvider.js";

class SimulatedFallbackProvider {
  async generateStream(messages, systemInstruction, onToken, onComplete, signal) {
    const userMessage = messages[messages.length - 1]?.content || "";
    const p = userMessage.toLowerCase();

    let reply = `I'm currently running in **Simulation Mode** because no active API keys are configured in the environment.

Here is a structured explanation based on your query:

1. **React Functional Layouts**: Use React components to compartmentalize logic. Hooks like \`useState\` manage component lifecycle parameters.
2. **Node.js Express Servers**: High-performance HTTP server frameworks that can handle real-time WebSockets and Server-Sent Events (SSE).
3. **Database Structuring**: Maintain relational indexes or flexible MongoDB collections to guarantee high performance and scalability.

Example snippet matching your search parameters:
\`\`\`javascript
// Simulated Code Output
function executeLmsTask(user) {
  console.log("Welcome to LMS Pro AI assistant, " + user.name + "!");
  return { status: "success", timestamp: new Date() };
}
\`\`\`

Ask me about Streaks, Quizzes, XP rewards, or specific course topics!`;

    const words = reply.split(/(\s+)/); // Keep spaces
    let accumulated = "";

    for (const word of words) {
      if (signal?.aborted) break;
      accumulated += word;
      onToken(word);
      // Wait a short duration to simulate real-time typing speed
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    onComplete(accumulated);
  }
}

export class ProviderFactory {
  static getProvider() {
    const providerType = (process.env.AI_PROVIDER || "openai").toLowerCase();

    if (providerType === "gemini" && process.env.GEMINI_API_KEY) {
      return new GeminiProvider(process.env.GEMINI_API_KEY);
    }
    if (providerType === "claude" && process.env.CLAUDE_API_KEY) {
      return new ClaudeProvider(process.env.CLAUDE_API_KEY);
    }
    if (providerType === "openai" && process.env.OPENAI_API_KEY) {
      return new OpenAIProvider(process.env.OPENAI_API_KEY);
    }

    // Auto-detect triggers if provider not explicitly configured
    if (process.env.OPENAI_API_KEY) return new OpenAIProvider(process.env.OPENAI_API_KEY);
    if (process.env.GEMINI_API_KEY) return new GeminiProvider(process.env.GEMINI_API_KEY);
    if (process.env.CLAUDE_API_KEY) return new ClaudeProvider(process.env.CLAUDE_API_KEY);

    // Fallback if no keys exist
    console.warn("[AI] No valid API Keys found. Initiating Simulated Fallback Provider.");
    return new SimulatedFallbackProvider();
  }
}
