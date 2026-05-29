import OpenAI from "openai";
import { getPreferenceValues } from "@raycast/api";

export interface Preferences {
  openaiApiKey: string;
}

export function createOpenAIClient(): OpenAI {
  const { openaiApiKey } = getPreferenceValues<Preferences>();
  return new OpenAI({ apiKey: openaiApiKey });
}
