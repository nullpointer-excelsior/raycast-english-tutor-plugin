import OpenAI from "openai";
import { GuidedTranslationModel, TranslationOptions } from "./models/guided-translation.model";

const TRANSLATION_MODEL = "gpt-4.1-mini";
const TRANSLATION_TEMPERATURE = 0;

const BASE_PROMPT = `You are a translation assistant. Detect the language of the given text.
- If it is in English, translate it to Spanish.
- If it is in Spanish, translate it to English.
All explanations MUST be about english input or translation, DO NOT explain spanish language.
The translation MUST be in the "translation" field.`;

const VOCABULARY_INSTRUCTION = `In the "vocabulary" field, provide a vocabulary breakdown in markdown of complex and uncommon words or phrases from the source text and their translations. Leave empty if not applicable.`;

const VERB_TENSES_INSTRUCTION = `In the "verbTenses" field, analyze and explain the verb tenses used in the english input or english traslation, explain the sentences that use verb tenses, not the verbs in isolation, respond in markdown format. Leave empty if not applicable.`;

const ALTERNATIVES_INSTRUCTION = `In the "alternatives" field, provide alternative ways to say the english input or english traslation in markdown format. Leave empty if not applicable.`;


export const GUIDED_TRANSLATION_SCHEMA = {
  type: "object",
  properties: {
    translation: {
      type: "string",
      description: "Direct translation of the source text into the target language.",
    },
    vocabulary: {
      type: "string",
      description: "Vocabulary breakdown of complex and uncommon words or phrases from english traslation or english input.",
    },
    verbTenses: {
      type: "string",
      description: "Analysis of verb tenses used in the source text from english traslation or english input.",
    },
    alternatives: {
      type: "string",
      description: "Alternative ways to express the english translation or english input.",
    },
  },
  required: ["translation", "vocabulary", "verbTenses", "alternatives"],
  additionalProperties: false,
} as const;

function buildSystemPrompt(options: TranslationOptions): string {
  const sections: string[] = [BASE_PROMPT];

  if (options.enableVocabulary) {
    sections.push(VOCABULARY_INSTRUCTION);
  }
  if (options.enableVerbTenses) {
    sections.push(VERB_TENSES_INSTRUCTION);
  }
  if (options.enableAlternatives) {
    sections.push(ALTERNATIVES_INSTRUCTION);
  }

  return sections.join("\n\n");
}

export async function translate(client: OpenAI, text: string, options: TranslationOptions): Promise<GuidedTranslationModel> {
  const completion = await client.chat.completions.parse({
    model: TRANSLATION_MODEL,
    temperature: TRANSLATION_TEMPERATURE,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "guided_translation",
        strict: true,
        schema: GUIDED_TRANSLATION_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: buildSystemPrompt(options) },
      { role: "user", content: text },
    ],
  });

  const parsed = completion.choices[0].message.parsed as GuidedTranslationModel | null;
  if (!parsed) {
    throw new Error("Unexpected AI response format");
  }

  return parsed;
}
