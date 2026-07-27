import { AIProvider } from "./AIProvider.js";

export class ClaudeProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async generateStream(
    messages,
    systemInstruction,
    onToken,
    onComplete,
    signal,
  ) {
    if (!this.apiKey) {
      throw new Error("Claude API key is missing");
    }

    const claudeMessages = [];
    messages.forEach((msg) => {
      if (msg.role !== "system") {
        claudeMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    });

    const body = {
      model: "claude-3-5-sonnet-20241022",
      messages: claudeMessages,
      max_tokens: 4000,
      stream: true,
    };

    if (systemInstruction) {
      body.system = systemInstruction;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Claude API returned error: ${response.status} - ${errText}`,
      );
    }

    const reader = response.body;
    if (!reader) {
      throw new Error("Claude response body is null");
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

        if (cleaned.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(cleaned.slice(6));
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              const content = parsed.delta.text;
              completeText += content;
              onToken(content);
            }
          } catch (e) {
            // Ignore parse errors on incomplete JSON fragments
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer && buffer.trim().startsWith("data: ")) {
      try {
        const parsed = JSON.parse(buffer.trim().slice(6));
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          const content = parsed.delta.text;
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
