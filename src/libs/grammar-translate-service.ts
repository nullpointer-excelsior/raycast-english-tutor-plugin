import OpenAI from "openai";
import { GrammarCorrection, GrammarTranslateResponse } from "./models/grammar-translate.model";

const MODEL = "gpt-4.1-mini";
const TEMPERATURE = 0;

const SYSTEM_PROMPT = `You are an expert Spanish tutor and translator.

The user will provide text in Spanish. Your tasks are:

1. Correct any grammar, spelling, or punctuation errors in the Spanish text.
2. Translate the corrected Spanish text into natural, idiomatic English.

Your response MUST contain exactly these four parts:
- original_text: the original text exactly as provided
- corrected_spanish: the Spanish text with all grammar and spelling errors fixed
- corrections: a list of each correction made, with:
  - original: the incorrect part
  - corrected: the fixed version
  - explanation: a brief explanation of the rule or change (in Spanish)
- english_translation: the natural English translation of the corrected Spanish

Important:
- Preserve the original meaning and tone.
- Only correct actual errors; do not change the user's style unnecessarily.
- Explain corrections in Spanish language.
- The English translation should sound natural and idiomatic.

Respond ONLY with valid JSON matching this schema:
{
  "original_text": "string",
  "corrected_spanish": "string",
  "corrections": [
    {
      "original": "string",
      "corrected": "string",
      "explanation": "string"
    }
  ],
  "english_translation": "string"
}`;

function isGrammarCorrection(value: unknown): value is GrammarCorrection {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as GrammarCorrection).original === "string" &&
    typeof (value as GrammarCorrection).corrected === "string" &&
    typeof (value as GrammarCorrection).explanation === "string"
  );
}

function parseCorrections(corrections: unknown): GrammarCorrection[] {
  if (!Array.isArray(corrections)) {
    return [];
  }
  return corrections.filter(isGrammarCorrection);
}

export async function grammarAndTranslate(client: OpenAI, inputText: string): Promise<GrammarTranslateResponse> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  let parsed: GrammarTranslateResponse;
  try {
    parsed = JSON.parse(content) as GrammarTranslateResponse;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    original_text: parsed.original_text ?? inputText,
    corrected_spanish: parsed.corrected_spanish ?? inputText,
    corrections: parseCorrections(parsed.corrections),
    english_translation: parsed.english_translation ?? "",
  };
}
