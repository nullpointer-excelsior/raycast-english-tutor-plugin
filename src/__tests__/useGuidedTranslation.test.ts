/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { showToast } from "@raycast/api";
import { APIError } from "openai";
import { useGuidedTranslation } from "../hooks/useGuidedTranslation";
import { translate } from "../libs/guided-translation-service";
import { DEFAULT_NETWORK_ERROR_MESSAGE, INVALID_API_KEY_ERROR_MESSAGE } from "../libs/openai-errors";

jest.mock("../libs/guided-translation-service");
jest.mock("../libs/openai-client", () => ({
  createOpenAIClient: jest.fn(() => ({})),
}));
jest.mock("@raycast/api");

const mockTranslate = translate as jest.Mock;
const mockShowToast = showToast as jest.Mock;

const MOCK_MODEL = {
  translation: "Hola, mundo",
  vocabulary: "",
  verbTenses: "",
};

describe("useGuidedTranslation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockTranslate.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useGuidedTranslation("Hello, world", true, true));

    expect(result.current.loading).toBe(true);
    expect(result.current.model).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("sets model on successful translation", async () => {
    mockTranslate.mockResolvedValue(MOCK_MODEL);
    const { result } = renderHook(() => useGuidedTranslation("Hello, world", true, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.model).toEqual(MOCK_MODEL);
    expect(result.current.error).toBeUndefined();
  });

  it("sets error and shows a toast on translation failure", async () => {
    mockTranslate.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useGuidedTranslation("Hello, world", true, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.model).toBeUndefined();
    expect(result.current.error).toBe("Network error");
    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Network error" }));
  });

  it("re-fetches when retry is called", async () => {
    mockTranslate.mockResolvedValue(MOCK_MODEL);
    const { result } = renderHook(() => useGuidedTranslation("Hello, world", true, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(mockTranslate).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(mockTranslate).toHaveBeenCalledTimes(2);
    });
  });

  it("uses the default network error message for non-Error rejections", async () => {
    mockTranslate.mockRejectedValue({ unexpected: true });
    const { result } = renderHook(() => useGuidedTranslation("Hello, world", true, true));

    await waitFor(() => {
      expect(result.current.error).toBe(DEFAULT_NETWORK_ERROR_MESSAGE);
    });
  });

  it("maps a 401 APIError to the invalid API key message", async () => {
    const err = new APIError(401, { message: "bad" }, undefined, undefined);
    mockTranslate.mockRejectedValue(err);
    const { result } = renderHook(() => useGuidedTranslation("Hello, world", true, true));

    await waitFor(() => {
      expect(result.current.error).toBe(INVALID_API_KEY_ERROR_MESSAGE);
    });
  });
});
