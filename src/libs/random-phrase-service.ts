import OpenAI from "openai";
import { ProficiencyLevel } from "./models/proficiency-level.model";

const MODEL = "gpt-4.1-mini";
const TEMPERATURE = 1;

const SYSTEM_PROMPT = `You are an English tutor that generates practice prompts for Spanish speakers learning English.

Generate a single, natural, random Spanish sentence that a learner could practice translating into English.
The sentence must be aligned with the given CEFR proficiency level, so the translation challenge matches the learner's expected grammar and vocabulary at that level:
  - A1: simple present, basic vocabulary, short everyday sentences (greetings, introductions, common needs).
  - A2: present continuous, past simple, common modal verbs, daily routines and simple requests.
  - B1: future, present perfect, comparatives, short subordinate clauses, opinions and plans.
  - B2: conditionals, passive voice, relative clauses, more abstract topics (work, news, health, preferences).
  - C1: nuanced phrasing, idioms, hypotheses, varied sentence structures (professional, academic, social debate).
  - C2: sophisticated, natural, and complex phrasing with cultural nuance and register awareness.

Vary topics across everyday situations (work, travel, food, hobbies, opinions, etc.).
Respond ONLY with the Spanish sentence, no explanations, no translations, no quotations, and no JSON.

Output format: a single line of plain Spanish text.`;

export async function generateRandomPhrase(client: OpenAI, complexity: ProficiencyLevel): Promise<string> {
  const userContent = `CEFR level: ${complexity}`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  const sentence = content.trim();
  if (!sentence) {
    throw new Error("Unexpected AI response format");
  }

  return sentence;
}
