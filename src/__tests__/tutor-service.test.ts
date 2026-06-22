import { analyzeTutor, TutorResponse } from "../libs/tutor-service";
import OpenAI from "openai";

jest.mock("openai");

const VALID_RESPONSE: TutorResponse = {
  corrected_text: "Hello, world!",
  corrections: [
    {
      original: "Hello world",
      corrected: "Hello, world!",
      explanation: "Add a comma after the greeting and use an exclamation mark.",
    },
  ],
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
    const result = await analyzeTutor(client, "Greeting", "Hello world");
    expect(result).toEqual(VALID_RESPONSE);
  });

  it("falls back to empty arrays when corrections field is missing", async () => {
    const partial = { corrected_text: "Hello, world!" };
    const client = makeOpenAIClient(JSON.stringify(partial));
    const result = await analyzeTutor(client, "Greeting", "Hello world");
    expect(result.corrected_text).toBe("Hello, world!");
    expect(result.corrections).toEqual([]);
  });

  it("falls back to empty string for corrected_text when missing", async () => {
    const client = makeOpenAIClient(JSON.stringify({ corrections: [] }));
    const result = await analyzeTutor(client, "Greeting", "Hello world");
    expect(result.corrected_text).toBe("");
  });

  it("throws when the response content is not valid JSON", async () => {
    const client = makeOpenAIClient("not valid json");
    await expect(analyzeTutor(client, "Greeting", "Hello world")).rejects.toThrow("Unexpected AI response format");
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
    await expect(analyzeTutor(client, "Greeting", "Hello world")).rejects.toThrow("Unexpected AI response format");
  });

  it("ignores malformed correction entries", async () => {
    const malformed = {
      corrected_text: "Fixed text",
      corrections: [
        { original: "bad", corrected: "good", explanation: "reason" },
        "not an object",
        { original: "missing fields" },
        42,
        null,
      ],
    };
    const client = makeOpenAIClient(JSON.stringify(malformed));
    const result = await analyzeTutor(client, "Context", "text");
    expect(result.corrections).toEqual([{ original: "bad", corrected: "good", explanation: "reason" }]);
  });
});
