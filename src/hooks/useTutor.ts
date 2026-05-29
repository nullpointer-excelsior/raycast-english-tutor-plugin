import { useEffect, useState } from "react";
import { showToast, Toast } from "@raycast/api";
import { APIError } from "openai";
import { createOpenAIClient } from "../libs/openai-client";
import { analyzeTutor, TutorResponse } from "../libs/tutor-service";

interface UseTutorState {
  loading: boolean;
  response: TutorResponse | undefined;
  error: string | undefined;
  retry: () => void;
}

export function useTutor(inputText: string): UseTutorState {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<TutorResponse | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    setResponse(undefined);

    const client = createOpenAIClient();

    analyzeTutor(client, inputText)
      .then((result) => {
        if (!cancelled) {
          setResponse(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        let message = "Network error. Check your connection.";
        if (err instanceof APIError) {
          message = err.status === 401 ? "Invalid OpenAI API Key. Check your preferences." : err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        showToast({ style: Toast.Style.Failure, title: message });
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  return {
    loading,
    response,
    error,
    retry: () => setRetryCount((c) => c + 1),
  };
}
