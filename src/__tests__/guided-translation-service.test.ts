import { GUIDED_TRANSLATION_SCHEMA, translate } from "../libs/guided-translation-service";
import { GuidedTranslationModel, TranslationOptions } from "../libs/models/guided-translation.model";
import OpenAI from "openai";

const ALL_ENABLED: TranslationOptions = {
  enableVocabulary: true,
  enableVerbTenses: true,
};

function makeOpenAIClient(parsed: GuidedTranslationModel | null): OpenAI {
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

describe("translate", () => {
  it("returns a parsed GuidedTranslationModel on a valid response", async () => {
    const client = makeOpenAIClient({
      translation: "Hola, ¿cómo estás?",
      vocabulary: "how are you -> cómo estás",
      verbTenses: "Present simple",
    });
    const result = await translate(client, "Hello, how are you?", ALL_ENABLED);
    expect(result).toEqual({
      translation: "Hola, ¿cómo estás?",
      vocabulary: "how are you -> cómo estás",
      verbTenses: "Present simple",
    });
  });

  it("returns empty strings for fields disabled by the system prompt", async () => {
    const client = makeOpenAIClient({
      translation: "Hola",
      vocabulary: "",
      verbTenses: "",
    });
    const result = await translate(client, "Hello", ALL_ENABLED);
    expect(result).toEqual({
      translation: "Hola",
      vocabulary: "",
      verbTenses: "",
    });
  });

  it("throws when the response fails to produce a parsed object", async () => {
    const client = makeOpenAIClient(null);
    await expect(translate(client, "Hello", ALL_ENABLED)).rejects.toThrow("Unexpected AI response format");
  });

  it("calls the API with the structured output schema, model and temperature", async () => {
    const client = makeOpenAIClient({
      translation: "Hola",
      vocabulary: "",
      verbTenses: "",
    });
    await translate(client, "Hello", ALL_ENABLED);

    const parseMock = client.chat.completions.parse as jest.Mock;
    const callArgs = parseMock.mock.calls[0][0];
    expect(callArgs.temperature).toBe(0);
    expect(callArgs.response_format).toEqual({
      type: "json_schema",
      json_schema: {
        name: "guided_translation",
        strict: true,
        schema: GUIDED_TRANSLATION_SCHEMA,
      },
    });
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toBe("Hello");
  });

  it("includes the vocabulary instruction in the system prompt when enabled", async () => {
    const client = makeOpenAIClient({ translation: "Hola", vocabulary: "", verbTenses: "" });
    await translate(client, "Hello", { enableVocabulary: true, enableVerbTenses: false });

    const parseMock = client.chat.completions.parse as jest.Mock;
    const systemContent = parseMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("vocabulary breakdown in markdown of complex and uncommon words or phrases");
    expect(systemContent).not.toContain("analyze and explain the verb tenses");
  });

  it("includes the verb tenses instruction in the system prompt when enabled", async () => {
    const client = makeOpenAIClient({ translation: "Hola", vocabulary: "", verbTenses: "" });
    await translate(client, "Hello", { enableVocabulary: false, enableVerbTenses: true });

    const parseMock = client.chat.completions.parse as jest.Mock;
    const systemContent = parseMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("analyze and explain the verb tenses");
    expect(systemContent).not.toContain("vocabulary breakdown of relevant words or phrases");
  });

  it("includes only the base prompt when all flags are disabled", async () => {
    const client = makeOpenAIClient({ translation: "Hola", vocabulary: "", verbTenses: "" });
    await translate(client, "Hello", { enableVocabulary: false, enableVerbTenses: false });

    const parseMock = client.chat.completions.parse as jest.Mock;
    const systemContent = parseMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("translation assistant");
    expect(systemContent).not.toContain("vocabulary breakdown of relevant words or phrases");
    expect(systemContent).not.toContain("analyze and explain the verb tenses");
  });
});
