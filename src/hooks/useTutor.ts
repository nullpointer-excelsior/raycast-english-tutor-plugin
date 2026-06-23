import { createOpenAIClient } from "../libs/openai-client";
import { classifyOpenAIError } from "../libs/openai-errors";
import { analyzeTutor, TutorResponse } from "../libs/tutor-service";
import { useAsyncResource } from "./useAsyncResource";

export interface UseTutorState {
  loading: boolean;
  response: TutorResponse | undefined;
  error: string | undefined;
  retry: () => void;
}

export function useTutor(inputContext: string, inputText: string): UseTutorState {
  const { loading, data, error, retry } = useAsyncResource(
    () => analyzeTutor(createOpenAIClient(), inputContext, inputText),
    [inputContext, inputText],
    { mapError: classifyOpenAIError },
  );

  return {
    loading,
    response: data,
    error,
    retry,
  };
}
