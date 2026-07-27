import { AIProvider } from "./AIProvider.js";

export class GeminiProvider extends AIProvider {
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
      throw new Error("Gemini API key is missing");
    }

    // Convert to Gemini API format: contents: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    const geminiContents = [];
    messages.forEach((msg) => {
      if (msg.role !== "system") {
        geminiContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    });

    const body = {
      contents: geminiContents,
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Gemini API returned error: ${response.status} - ${errText}`,
      );
    }

    const reader = response.body;
    if (!reader) {
      throw new Error("Gemini response body is null");
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

        // Clean JSON stream delimiters ([ , ])
        let jsonStr = cleaned;
        if (jsonStr.startsWith("[")) jsonStr = jsonStr.slice(1);
        if (jsonStr.startsWith(",")) jsonStr = jsonStr.slice(1);
        if (jsonStr.endsWith("]")) jsonStr = jsonStr.slice(0, -1);
        jsonStr = jsonStr.trim();

        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const content =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (content) {
            completeText += content;
            onToken(content);
          }
        } catch (e) {
          // Ignore parse errors on incomplete JSON chunks
        }
      }
    }

    // Process remaining buffer
    let jsonStr = buffer.trim();
    if (jsonStr) {
      if (jsonStr.startsWith("[")) jsonStr = jsonStr.slice(1);
      if (jsonStr.startsWith(",")) jsonStr = jsonStr.slice(1);
      if (jsonStr.endsWith("]")) jsonStr = jsonStr.slice(0, -1);
      jsonStr = jsonStr.trim();
      if (jsonStr) {
        try {
          const parsed = JSON.parse(jsonStr);
          const content =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (content) {
            completeText += content;
            onToken(content);
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    onComplete(completeText);
  }
}
