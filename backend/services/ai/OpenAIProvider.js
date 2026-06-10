import { AIProvider } from "./AIProvider.js";

export class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async generateStream(messages, systemInstruction, onToken, onComplete, signal) {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is missing");
    }

    const openaiMessages = [];
    if (systemInstruction) {
      openaiMessages.push({ role: "system", content: systemInstruction });
    }
    messages.forEach((msg) => {
      openaiMessages.push({
        role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
        content: msg.content,
      });
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API returned error: ${response.status} - ${errText}`);
    }

    const reader = response.body;
    if (!reader) {
      throw new Error("OpenAI response body is null");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let completeText = "";

    for await (const chunk of reader) {
      if (signal?.aborted) break;
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;
        if (cleaned === "data: [DONE]") continue;

        if (cleaned.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(cleaned.slice(6));
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              completeText += content;
              onToken(content);
            }
          } catch (e) {
            // Ignore parse errors on incomplete JSON fragments
          }
        }
      }
    }
    
    // Process remaining buffer if any
    if (buffer && buffer.trim().startsWith("data: ")) {
      try {
        const parsed = JSON.parse(buffer.trim().slice(6));
        const content = parsed.choices?.[0]?.delta?.content || "";
        if (content) {
          completeText += content;
          onToken(content);
        }
      } catch (e) {
        // Ignore
      }
    }

    onComplete(completeText);
  }
}
