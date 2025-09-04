// services/geminiAPI.ts
export type RefinementType = "clarity" | "detail" | "conciseness";

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export class GeminiAPIService {
  private readonly BASE_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

  async refineSteps(
    apiKey: string,
    steps: string[],
    refinementType: RefinementType
  ): Promise<string[]> {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (!steps.length) {
      return [];
    }

    const prompt = this.buildRefinementPrompt(steps, refinementType);

    try {
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || !data.candidates[0]) {
        throw new Error("No response from Gemini API");
      }

      const refinedText = data.candidates[0].content.parts[0].text;
      return this.parseRefinedSteps(refinedText);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to refine steps");
    }
  }

  async estimateTokenCost(steps: string[]): Promise<number> {
    // Rough estimation: ~4 characters per token for English text
    const totalChars = steps.join(" ").length;
    const estimatedTokens = Math.ceil(totalChars / 4);

    // Add overhead for prompt and response
    return estimatedTokens + 200;
  }

  private buildRefinementPrompt(steps: string[], type: RefinementType): string {
    const stepsText = steps
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");

    const prompts = {
      clarity: `Please refine the following step-by-step instructions to make them clearer and easier to understand. Maintain the original meaning but improve readability:

${stepsText}

Please provide the refined steps in the same numbered format.`,

      detail: `Please enhance the following step-by-step instructions by adding more specific details and explanations where appropriate. Make each step more comprehensive while keeping them actionable:

${stepsText}

Please provide the enhanced steps in the same numbered format.`,

      conciseness: `Please refine the following step-by-step instructions to make them more concise while preserving all essential information. Remove any redundancy and streamline the language:

${stepsText}

Please provide the concise steps in the same numbered format.`,
    };

    return prompts[type];
  }

  private parseRefinedSteps(responseText: string): string[] {
    // Try to parse numbered steps from the response
    const lines = responseText.split("\n").filter((line) => line.trim());

    const steps: string[] = [];
    const stepRegex = /^\d+\.\s*(.+)$/;

    for (const line of lines) {
      const match = line.match(stepRegex);
      if (match) {
        steps.push(match[1].trim());
      } else if (steps.length > 0 && line.trim()) {
        // If it's a continuation of the previous step
        steps[steps.length - 1] += " " + line.trim();
      }
    }

    // If no numbered steps found, try to split by other common patterns
    if (steps.length === 0) {
      // Split by bullet points or other delimiters
      const bulletRegex = /^[-•*]\s*(.+)$/;
      for (const line of lines) {
        const match = line.match(bulletRegex);
        if (match) {
          steps.push(match[1].trim());
        }
      }
    }

    // If still no steps, treat the entire response as one step
    if (steps.length === 0) {
      steps.push(responseText.trim());
    }

    return steps;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Make a simple test request to validate the key
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello",
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async summarizeDocument(
    apiKey: string,
    documentText: string
  ): Promise<string> {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (!documentText.trim()) {
      return "No content to summarize";
    }

    const prompt = `Please provide a clear and concise summary of the following step-by-step guide. Focus on the main objective and key actions:

${documentText}

Summary:`;

    try {
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || !data.candidates[0]) {
        throw new Error("No response from Gemini API");
      }

      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to summarize document");
    }
  }
}
