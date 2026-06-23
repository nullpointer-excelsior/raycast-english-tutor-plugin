import { useEffect, useState } from "react";
import { showToast, Toast } from "@raycast/api";
import { DEFAULT_NETWORK_ERROR_MESSAGE } from "../libs/openai-errors";

export interface UseAsyncResourceState<T> {
  loading: boolean;
  data: T | undefined;
  error: string | undefined;
  retry: () => void;
}

export interface UseAsyncResourceOptions {
  mapError?: (err: unknown) => string;
  showErrorToast?: boolean;
}

export function useAsyncResource<T>(
  factory: () => Promise<T>,
  deps: unknown[] = [],
  options: UseAsyncResourceOptions = {},
): UseAsyncResourceState<T> {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    setData(undefined);

    factory()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        const message = options.mapError
          ? options.mapError(err)
          : err instanceof Error
            ? err.message
            : DEFAULT_NETWORK_ERROR_MESSAGE;

        if (options.showErrorToast !== false) {
          showToast({ style: Toast.Style.Failure, title: message });
        }

        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount, ...deps]);

  return {
    loading,
    data,
    error,
    retry: () => setRetryCount((count) => count + 1),
  };
}
