import { TRANSLATION_SCHEMA, translateText } from "../libs/translation-service";
import OpenAI from "openai";

function makeOpenAIClient(parsed: { sourceLanguage: string; translation: string } | null): OpenAI {
  return {
    chat: {
      completions: {
        create: jest.fn(),
        parse: jest.fn().mockResolvedValue({
          choices: [{ message: { content: null, parsed } }],
        }),
      },
    },
  } as unknown as OpenAI;
}

describe("translateText", () => {
  it("returns the parsed source language and translation", async () => {
    const client = makeOpenAIClient({ sourceLanguage: "english", translation: "Hola, ¿cómo estás?" });
    const result = await translateText(client, "Hello, how are you?");
    expect(result).toEqual({ sourceLanguage: "english", translation: "Hola, ¿cómo estás?" });
  });

  it("throws when the response fails to produce a parsed object", async () => {
    const client = makeOpenAIClient(null);
    await expect(translateText(client, "Hello, how are you?")).rejects.toThrow("Unexpected AI response format");
  });

  it("calls the API with the structured output schema, model and message roles", async () => {
    const client = makeOpenAIClient({ sourceLanguage: "english", translation: "Translated" });
    await translateText(client, "Some input");

    const parseMock = client.chat.completions.parse as jest.Mock;
    const callArgs = parseMock.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4.1-nano");
    expect(callArgs.response_format).toEqual({
      type: "json_schema",
      json_schema: {
        name: "translation",
        strict: true,
        schema: TRANSLATION_SCHEMA,
      },
    });
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toBe("Some input");
  });

  it("requires the source language detection in the schema", () => {
    expect(TRANSLATION_SCHEMA.required).toEqual(["sourceLanguage", "translation"]);
    expect(TRANSLATION_SCHEMA.properties.sourceLanguage.enum).toEqual(["english", "spanish"]);
  });
});
