import OpenAI from "openai";
import { GuidedTranslationModel, TranslationOptions } from "./models/guided-translation.model";

const TRANSLATION_MODEL = "gpt-4.1-nano";
const TRANSLATION_TEMPERATURE = 0;

const BASE_PROMPT = `You are a translation assistant. Detect the language of the given text.
- If it is in English, translate it to Spanish.
- If it is in Spanish, translate it to English.
The translation MUST be in the "translation" field.`;

const VOCABULARY_INSTRUCTION = `In the "vocabulary" field, provide a vocabulary breakdown of relevant words or phrases from the source text and their translations. Leave empty if not applicable.`;

const VERB_TENSES_INSTRUCTION = `In the "verbTenses" field, analyze and explain the verb tenses used in the source text. Leave empty if not applicable.`;

const ALTERNATIVES_INSTRUCTION = `In the "alternatives" field, provide alternative ways to say the translated text in the target language. Leave empty if not applicable.`;

const SCHEMA_INSTRUCTION = `Respond ONLY with valid JSON matching this schema:
{
  "translation": "string",
  "vocabulary": "string",
  "verbTenses": "string",
  "alternatives": "string"
}
Fields for disabled instructions MUST be empty strings.`;

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

  sections.push(SCHEMA_INSTRUCTION);
  return sections.join("\n\n");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function translate(
  client: OpenAI,
  text: string,
  options: TranslationOptions,
): Promise<GuidedTranslationModel> {
  const completion = await client.chat.completions.create({
    model: TRANSLATION_MODEL,
    temperature: TRANSLATION_TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(options) },
      { role: "user", content: text },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    translation: asString(parsed.translation),
    vocabulary: asString(parsed.vocabulary),
    verbTenses: asString(parsed.verbTenses),
    alternatives: asString(parsed.alternatives),
  };
}
