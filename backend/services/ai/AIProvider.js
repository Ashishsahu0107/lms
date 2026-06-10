export class AIProvider {
  /**
   * Generates a streamed response for the given messages.
   * @param {Array} messages - Formatted list of messages for the provider
   * @param {string} systemInstruction - Developer context prompt
   * @param {Function} onToken - Callback invoked for each token generated
   * @param {Function} onComplete - Callback invoked on completion with full response text
   * @param {AbortSignal} signal - Abort signal to cancel execution
   */
  async generateStream(messages, systemInstruction, onToken, onComplete, signal) {
    throw new Error("generateStream not implemented");
  }
}
