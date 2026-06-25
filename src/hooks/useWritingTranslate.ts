import { createOpenAIClient } from "../libs/openai-client";
import { classifyOpenAIError } from "../libs/openai-errors";
import { writingAndTranslate } from "../libs/writing-translate-service";
import { WritingTranslateResponse } from "../libs/models/writing-translate.model";
import { useAsyncResource } from "./useAsyncResource";

export interface UseWritingTranslateState {
  loading: boolean;
  response: WritingTranslateResponse | undefined;
  error: string | undefined;
  retry: () => void;
}

export function useWritingTranslate(inputText: string): UseWritingTranslateState {
  const { loading, data, error, retry } = useAsyncResource(
    () => writingAndTranslate(createOpenAIClient(), inputText),
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
