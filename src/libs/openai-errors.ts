import { APIError } from "openai";

export const DEFAULT_NETWORK_ERROR_MESSAGE = "Network error. Check your connection.";
export const INVALID_API_KEY_ERROR_MESSAGE = "Invalid OpenAI API Key. Check your preferences.";

export function classifyOpenAIError(err: unknown): string {
  if (err instanceof APIError) {
    return err.status === 401 ? INVALID_API_KEY_ERROR_MESSAGE : err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return DEFAULT_NETWORK_ERROR_MESSAGE;
}
