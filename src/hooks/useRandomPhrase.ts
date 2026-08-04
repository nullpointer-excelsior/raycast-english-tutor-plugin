import { useState } from "react";
import { createOpenAIClient } from "../libs/openai-client";
import { classifyOpenAIError } from "../libs/openai-errors";
import { generateRandomPhrase } from "../libs/random-phrase-service";
import { ProficiencyLevel } from "../libs/models/proficiency-level.model";

export interface UseRandomPhraseState {
  loading: boolean;
  phrase: string | undefined;
  error: string | undefined;
  generate: (complexity: ProficiencyLevel) => Promise<string | undefined>;
}

export function useRandomPhrase(): UseRandomPhraseState {
  const [loading, setLoading] = useState(false);
  const [phrase, setPhrase] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  async function generate(complexity: ProficiencyLevel): Promise<string | undefined> {
    setLoading(true);
    setError(undefined);
    try {
      const result = await generateRandomPhrase(createOpenAIClient(), complexity);
      setPhrase(result);
      return result;
    } catch (err: unknown) {
      const message = classifyOpenAIError(err);
      setError(message);
      setPhrase(undefined);
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  return { loading, phrase, error, generate };
}
