import OpenAI from "openai";

const TUTOR_MODEL = "gpt-4.1-mini";
const TUTOR_TEMPERATURE = 0;

const TUTOR_SYSTEM_PROMPT = `You are an expert English tutor. Help the user learn English.

The user will provide:
1. Context or intention: what they want to say (may be in English or Spanish).
2. Their English text: the sentence or phrase they wrote and want corrected.

Your response MUST contain exactly these two parts:
1. The corrected English text.
2. A list of grammar and spelling corrections, each with:
   - original: the part of the text that was wrong
   - corrected: how it should be written
   - explanation: a brief explanation of the grammar or spelling rule

Important:
- The corrected text must be natural and appropriate for the given context.
- If the user's intention is in Spanish, translate it into natural English in the corrected text.
- The user may include Spanish words inside "<>" when they don't know the English word; replace them with the correct English word in the corrected text.
- Explain grammar, spelling, verb tenses, and word choice clearly.

Respond ONLY with valid JSON matching this schema:
{
  "corrected_text": "string",
  "corrections": [
    {
      "original": "string",
      "corrected": "string",
      "explanation": "string"
    }
  ]
}`;

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface TutorResponse {
  corrected_text: string;
  corrections: GrammarCorrection[];
}

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

export async function analyzeTutor(client: OpenAI, inputContext: string, inputText: string): Promise<TutorResponse> {
  const userContent = `Context / Intention:\n${inputContext.trim() || "No context provided."}\n\nText to correct:\n${inputText}`;

  const completion = await client.chat.completions.create({
    model: TUTOR_MODEL,
    temperature: TUTOR_TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: TUTOR_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  let parsed: TutorResponse;
  try {
    parsed = JSON.parse(content) as TutorResponse;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    corrected_text: parsed.corrected_text ?? "",
    corrections: parseCorrections(parsed.corrections),
  };
}
