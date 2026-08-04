import { generateRandomPhrase } from "../libs/random-phrase-service";
import OpenAI from "openai";

jest.mock("openai");

const VALID_SENTENCE = "¿Podrías decirme dónde está la oficina de correos más cercana?";

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

describe("generateRandomPhrase", () => {
  it("returns the Spanish sentence as plain text", async () => {
    const client = makeOpenAIClient(VALID_SENTENCE);
    const result = await generateRandomPhrase(client, "B1");
    expect(result).toBe(VALID_SENTENCE);
  });

  it("trims whitespace around the sentence", async () => {
    const client = makeOpenAIClient(`  ${VALID_SENTENCE}  `);
    const result = await generateRandomPhrase(client, "A1");
    expect(result).toBe(VALID_SENTENCE);
  });

  it("throws when message content is null", async () => {
    const client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: null } }],
          }),
        },
      },
    } as unknown as OpenAI;
    await expect(generateRandomPhrase(client, "C2")).rejects.toThrow("Unexpected AI response format");
  });

  it("throws when message content is empty", async () => {
    const client = makeOpenAIClient("   ");
    await expect(generateRandomPhrase(client, "B2")).rejects.toThrow("Unexpected AI response format");
  });
});
