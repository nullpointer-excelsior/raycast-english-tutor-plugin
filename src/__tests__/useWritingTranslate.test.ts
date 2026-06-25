/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { showToast } from "@raycast/api";
import { APIError } from "openai";
import { useWritingTranslate } from "../hooks/useWritingTranslate";
import { writingAndTranslate } from "../libs/writing-translate-service";
import { DEFAULT_NETWORK_ERROR_MESSAGE, INVALID_API_KEY_ERROR_MESSAGE } from "../libs/openai-errors";

jest.mock("../libs/writing-translate-service");
jest.mock("../libs/openai-client", () => ({
  createOpenAIClient: jest.fn(() => ({})),
}));

const mockWritingAndTranslate = writingAndTranslate as jest.Mock;
const mockShowToast = showToast as jest.Mock;

const MOCK_RESPONSE = {
  original_text: "Hola mundo",
  english_translation: "Hello world",
  improved_writing: "Hello, world!",
  corrections: [{ original: "Hello world", corrected: "Hello, world!", explanation: "Add punctuation." }],
};

describe("useWritingTranslate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockWritingAndTranslate.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useWritingTranslate("Hola mundo"));

    expect(result.current.loading).toBe(true);
    expect(result.current.response).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("sets response on successful API call", async () => {
    mockWritingAndTranslate.mockResolvedValue(MOCK_RESPONSE);
    const { result } = renderHook(() => useWritingTranslate("Hola mundo"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.response).toEqual(MOCK_RESPONSE);
    expect(result.current.error).toBeUndefined();
  });

  it("sets error message on API failure", async () => {
    mockWritingAndTranslate.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useWritingTranslate("Hola mundo"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.response).toBeUndefined();
    expect(result.current.error).toBe("Network error");
  });

  it("shows a toast on API failure", async () => {
    mockWritingAndTranslate.mockRejectedValue(new Error("Something went wrong"));
    renderHook(() => useWritingTranslate("Hola mundo"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Something went wrong" }));
    });
  });

  it("re-fetches when retry is called", async () => {
    mockWritingAndTranslate.mockResolvedValue(MOCK_RESPONSE);
    const { result } = renderHook(() => useWritingTranslate("Hola mundo"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(mockWritingAndTranslate).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(mockWritingAndTranslate).toHaveBeenCalledTimes(2);
    });
  });

  it("uses the default network error message for non-Error rejections", async () => {
    mockWritingAndTranslate.mockRejectedValue({ unexpected: true });
    const { result } = renderHook(() => useWritingTranslate("Hola mundo"));

    await waitFor(() => {
      expect(result.current.error).toBe(DEFAULT_NETWORK_ERROR_MESSAGE);
    });
  });

  it("maps a 401 APIError to the invalid API key message", async () => {
    const err = new APIError(401, { message: "bad" }, undefined, undefined);
    mockWritingAndTranslate.mockRejectedValue(err);
    const { result } = renderHook(() => useWritingTranslate("Hola mundo"));

    await waitFor(() => {
      expect(result.current.error).toBe(INVALID_API_KEY_ERROR_MESSAGE);
    });
  });
});
