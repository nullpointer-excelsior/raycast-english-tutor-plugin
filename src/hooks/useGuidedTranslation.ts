import { createOpenAIClient } from "../libs/openai-client";
import { classifyOpenAIError } from "../libs/openai-errors";
import { translate } from "../libs/guided-translation-service";
import { GuidedTranslationModel, TranslationOptions } from "../libs/models/guided-translation.model";
import { useAsyncResource } from "./useAsyncResource";

export interface UseGuidedTranslationState {
  loading: boolean;
  model: GuidedTranslationModel | undefined;
  error: string | undefined;
  retry: () => void;
}

export function useGuidedTranslation(
  inputText: string,
  enableVocabulary: boolean,
  enableVerbTenses: boolean,
): UseGuidedTranslationState {
  const options: TranslationOptions = { enableVocabulary, enableVerbTenses };

  const { loading, data, error, retry } = useAsyncResource(
    () => translate(createOpenAIClient(), inputText, options),
    [inputText, enableVocabulary, enableVerbTenses],
    { mapError: classifyOpenAIError },
  );

  return {
    loading,
    model: data,
    error,
    retry,
  };
}
