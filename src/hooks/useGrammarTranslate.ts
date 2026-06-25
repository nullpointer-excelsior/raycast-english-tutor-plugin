import { createOpenAIClient } from "../libs/openai-client";
import { classifyOpenAIError } from "../libs/openai-errors";
import { grammarAndTranslate } from "../libs/grammar-translate-service";
import { GrammarTranslateResponse } from "../libs/models/grammar-translate.model";
import { useAsyncResource } from "./useAsyncResource";

export interface UseGrammarTranslateState {
  loading: boolean;
  response: GrammarTranslateResponse | undefined;
  error: string | undefined;
  retry: () => void;
}

export function useGrammarTranslate(inputText: string): UseGrammarTranslateState {
  const { loading, data, error, retry } = useAsyncResource(
    () => grammarAndTranslate(createOpenAIClient(), inputText),
    [inputText],
    { mapError: classifyOpenAIError },
  );

  return {
    loading,
    response: data,
    error,
    retry,
  };
}
