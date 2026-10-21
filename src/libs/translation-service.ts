import OpenAI from "openai";
import { TranslationResult } from "./models/translation-result.model";

const TRANSLATION_MODEL = "gpt-4.1-nano";

const DETECT_AND_TRANSLATE_PROMPT = `You are a translation assistant. Detect the language of the given text.
- If it is in English, translate it to Spanish.
- If it is in Spanish, translate it to English.
The translation MUST be in the "translation" field.
Report the detected language of the source text in the "sourceLanguage" field ("english" or "spanish").`;

export const TRANSLATION_SCHEMA = {
  type: "object",
  properties: {
    sourceLanguage: {
      type: "string",
      enum: ["english", "spanish"],
      description: "Detected language of the source text.",
    },
    translation: {
      type: "string",
      description: "Direct translation of the source text into the target language.",
    },
  },
  required: ["sourceLanguage", "translation"],
  additionalProperties: false,
} as const;

export async function translateText(client: OpenAI, text: string): Promise<TranslationResult> {
  const completion = await client.chat.completions.parse({
    model: TRANSLATION_MODEL,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "translation",
        strict: true,
        schema: TRANSLATION_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: DETECT_AND_TRANSLATE_PROMPT },
      { role: "user", content: text },
    ],
  });

  const parsed = completion.choices[0].message.parsed as TranslationResult | null;
  if (!parsed) {
    throw new Error("Unexpected AI response format");
  }

  return parsed;
}
