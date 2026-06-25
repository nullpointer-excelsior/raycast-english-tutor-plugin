import OpenAI from "openai";
import { writingAndTranslate } from "../libs/writing-translate-service";
import { WritingTranslateResponse } from "../libs/models/writing-translate.model";

function makeOpenAIClient(content: string | null): OpenAI {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content } }],
        }),
      },
    },
  } as unknown as OpenAI;
}

const VALID_RESPONSE: WritingTranslateResponse = {
  original_text: "Hola mundo",
  english_translation: "Hello world",
  improved_writing: "Hello, world!",
  corrections: [
    {
      original: "Hello world",
      corrected: "Hello, world!",
      explanation: "Add a comma for clarity.",
    },
  ],
};

describe("writingAndTranslate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a parsed WritingTranslateResponse on valid JSON", async () => {
    const client = makeOpenAIClient(JSON.stringify(VALID_RESPONSE));
    const result = await writingAndTranslate(client, "Hola mundo");

    expect(result).toEqual(VALID_RESPONSE);
  });

  it("falls back to empty strings and arrays when fields are missing", async () => {
    const partial = { english_translation: "Hello world" };
    const client = makeOpenAIClient(JSON.stringify(partial));
    const result = await writingAndTranslate(client, "Hola mundo");

    expect(result.original_text).toBe("Hola mundo");
    expect(result.english_translation).toBe("Hello world");
    expect(result.improved_writing).toBe("");
    expect(result.corrections).toEqual([]);
  });

  it("throws when the response content is not valid JSON", async () => {
    const client = makeOpenAIClient("not valid json");
    await expect(writingAndTranslate(client, "Hola mundo")).rejects.toThrow("Unexpected AI response format");
  });

  it("handles null message content by using empty string", async () => {
    const client = makeOpenAIClient(null);
    await expect(writingAndTranslate(client, "Hola mundo")).rejects.toThrow("Unexpected AI response format");
  });

  it("ignores non-array corrections", async () => {
    const malformed = {
      english_translation: "Hello world",
      improved_writing: "Hello, world!",
      corrections: "not an array",
    };
    const client = makeOpenAIClient(JSON.stringify(malformed));
    const result = await writingAndTranslate(client, "Hola mundo");

    expect(result.corrections).toEqual([]);
  });

  it("calls the API with the correct model and system prompt", async () => {
    const client = makeOpenAIClient(JSON.stringify(VALID_RESPONSE));
    await writingAndTranslate(client, "Hola mundo");

    const createMock = client.chat.completions.create as jest.Mock;
    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4.1-mini");
    expect(callArgs.temperature).toBe(0);
    expect(callArgs.response_format).toEqual({ type: "json_object" });
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toBe("Hola mundo");
  });
});
