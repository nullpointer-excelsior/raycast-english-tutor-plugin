import { analyzeTutor, TutorResponse } from "../libs/tutor-service";
import OpenAI from "openai";

jest.mock("openai");

const VALID_RESPONSE: TutorResponse = {
  corrected_text: "Hello, world!",
  errors: ["Missing comma"],
  corrections: ["Added comma after 'Hello'"],
  suggestions: ["Use a more descriptive greeting"],
};

function makeOpenAIClient(content: string): OpenAI {
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

describe("analyzeTutor", () => {
  it("returns a parsed TutorResponse on valid JSON", async () => {
    const client = makeOpenAIClient(JSON.stringify(VALID_RESPONSE));
    const result = await analyzeTutor(client, "Hello world");
    expect(result).toEqual(VALID_RESPONSE);
  });

  it("falls back to empty arrays when fields are missing", async () => {
    const partial = { corrected_text: "Hello, world!" };
    const client = makeOpenAIClient(JSON.stringify(partial));
    const result = await analyzeTutor(client, "Hello world");
    expect(result.corrected_text).toBe("Hello, world!");
    expect(result.errors).toEqual([]);
    expect(result.corrections).toEqual([]);
    expect(result.suggestions).toEqual([]);
  });

  it("falls back to empty string for corrected_text when missing", async () => {
    const client = makeOpenAIClient(JSON.stringify({ errors: [] }));
    const result = await analyzeTutor(client, "Hello world");
    expect(result.corrected_text).toBe("");
  });

  it("throws when the response content is not valid JSON", async () => {
    const client = makeOpenAIClient("not valid json");
    await expect(analyzeTutor(client, "Hello world")).rejects.toThrow("Unexpected AI response format");
  });

  it("handles null message content by using empty string", async () => {
    const client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: null } }],
          }),
        },
      },
    } as unknown as OpenAI;
    await expect(analyzeTutor(client, "Hello world")).rejects.toThrow("Unexpected AI response format");
  });

  it("ignores non-array values for list fields", async () => {
    const malformed = {
      corrected_text: "Fixed text",
      errors: "not an array",
      corrections: 42,
      suggestions: null,
    };
    const client = makeOpenAIClient(JSON.stringify(malformed));
    const result = await analyzeTutor(client, "text");
    expect(result.errors).toEqual([]);
    expect(result.corrections).toEqual([]);
    expect(result.suggestions).toEqual([]);
  });
});
