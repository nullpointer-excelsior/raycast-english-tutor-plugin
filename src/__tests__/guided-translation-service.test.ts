import { translate } from "../libs/guided-translation-service";
import { TranslationOptions } from "../libs/models/guided-translation.model";
import OpenAI from "openai";

const ALL_ENABLED: TranslationOptions = {
  enableVocabulary: true,
  enableVerbTenses: true,
  enableAlternatives: true,
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

describe("translate", () => {
  it("returns a parsed GuidedTranslationModel on valid JSON", async () => {
    const client = makeOpenAIClient(
      JSON.stringify({
        translation: "Hola, ¿cómo estás?",
        vocabulary: "how are you -> cómo estás",
        verbTenses: "Present simple",
        alternatives: "¿Qué tal?",
      }),
    );
    const result = await translate(client, "Hello, how are you?", ALL_ENABLED);
    expect(result).toEqual({
      translation: "Hola, ¿cómo estás?",
      vocabulary: "how are you -> cómo estás",
      verbTenses: "Present simple",
      alternatives: "¿Qué tal?",
    });
  });

  it("falls back to empty strings when fields are missing", async () => {
    const client = makeOpenAIClient(JSON.stringify({ translation: "Hola" }));
    const result = await translate(client, "Hello", ALL_ENABLED);
    expect(result.translation).toBe("Hola");
    expect(result.vocabulary).toBe("");
    expect(result.verbTenses).toBe("");
    expect(result.alternatives).toBe("");
  });

  it("coerces non-string field values to empty string", async () => {
    const client = makeOpenAIClient(
      JSON.stringify({
        translation: 42,
        vocabulary: null,
        verbTenses: { tense: "present" },
        alternatives: ["a", "b"],
      }),
    );
    const result = await translate(client, "Hello", ALL_ENABLED);
    expect(result.translation).toBe("");
    expect(result.vocabulary).toBe("");
    expect(result.verbTenses).toBe("");
    expect(result.alternatives).toBe("");
  });

  it("throws when the response content is not valid JSON", async () => {
    const client = makeOpenAIClient("not valid json");
    await expect(translate(client, "Hello", ALL_ENABLED)).rejects.toThrow("Unexpected AI response format");
  });

  it("handles null message content by throwing", async () => {
    const client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: null } }],
          }),
        },
      },
    } as unknown as OpenAI;
    await expect(translate(client, "Hello", ALL_ENABLED)).rejects.toThrow("Unexpected AI response format");
  });

  it("calls the API with correct model, temperature and response_format", async () => {
    const client = makeOpenAIClient(JSON.stringify({ translation: "Hola" }));
    await translate(client, "Hello", ALL_ENABLED);

    const createMock = client.chat.completions.create as jest.Mock;
    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4.1-nano");
    expect(callArgs.temperature).toBe(0);
    expect(callArgs.response_format).toEqual({ type: "json_object" });
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toBe("Hello");
  });

  it("includes the vocabulary instruction in the system prompt when enabled", async () => {
    const client = makeOpenAIClient(JSON.stringify({ translation: "Hola" }));
    await translate(client, "Hello", { enableVocabulary: true, enableVerbTenses: false, enableAlternatives: false });

    const createMock = client.chat.completions.create as jest.Mock;
    const systemContent = createMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("vocabulary breakdown of relevant words or phrases");
    expect(systemContent).not.toContain("analyze and explain the verb tenses");
    expect(systemContent).not.toContain("alternative ways to say the translated text");
  });

  it("includes the verb tenses instruction in the system prompt when enabled", async () => {
    const client = makeOpenAIClient(JSON.stringify({ translation: "Hola" }));
    await translate(client, "Hello", { enableVocabulary: false, enableVerbTenses: true, enableAlternatives: false });

    const createMock = client.chat.completions.create as jest.Mock;
    const systemContent = createMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("analyze and explain the verb tenses");
    expect(systemContent).not.toContain("vocabulary breakdown of relevant words or phrases");
    expect(systemContent).not.toContain("alternative ways to say the translated text");
  });

  it("includes the alternatives instruction in the system prompt when enabled", async () => {
    const client = makeOpenAIClient(JSON.stringify({ translation: "Hola" }));
    await translate(client, "Hello", { enableVocabulary: false, enableVerbTenses: false, enableAlternatives: true });

    const createMock = client.chat.completions.create as jest.Mock;
    const systemContent = createMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("alternative ways to say the translated text");
    expect(systemContent).not.toContain("vocabulary breakdown of relevant words or phrases");
    expect(systemContent).not.toContain("analyze and explain the verb tenses");
  });

  it("includes only the base prompt and schema when all flags are disabled", async () => {
    const client = makeOpenAIClient(JSON.stringify({ translation: "Hola" }));
    await translate(client, "Hello", { enableVocabulary: false, enableVerbTenses: false, enableAlternatives: false });

    const createMock = client.chat.completions.create as jest.Mock;
    const systemContent = createMock.mock.calls[0][0].messages[0].content as string;
    expect(systemContent).toContain("translation assistant");
    expect(systemContent).not.toContain("vocabulary breakdown of relevant words or phrases");
    expect(systemContent).not.toContain("analyze and explain the verb tenses");
    expect(systemContent).not.toContain("alternative ways to say the translated text");
  });
});
