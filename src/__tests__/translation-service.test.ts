import { translateText } from "../libs/translation-service";
import OpenAI from "openai";

function makeOpenAIClient(translatedContent: string | null): OpenAI {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: translatedContent } }],
        }),
      },
    },
  } as unknown as OpenAI;
}

describe("translateText", () => {
  it("returns the translated content from the API response", async () => {
    const client = makeOpenAIClient("Hola, ¿cómo estás?");
    const result = await translateText(client, "Hello, how are you?");
    expect(result).toBe("Hola, ¿cómo estás?");
  });

  it("falls back to the original text when content is null", async () => {
    const client = makeOpenAIClient(null);
    const result = await translateText(client, "Hello, how are you?");
    expect(result).toBe("Hello, how are you?");
  });

  it("calls the API with correct model and system prompt role", async () => {
    const client = makeOpenAIClient("Translated");
    await translateText(client, "Some input");

    const createMock = (client.chat.completions.create as jest.Mock);
    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4.1-nano");
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toBe("Some input");
  });
});
