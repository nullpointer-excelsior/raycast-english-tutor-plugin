/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTutor } from "../hooks/useTutor";
import { analyzeTutor } from "../libs/tutor-service";
import { showToast } from "@raycast/api";

jest.mock("../libs/tutor-service");
jest.mock("../libs/openai-client", () => ({
  createOpenAIClient: jest.fn(() => ({})),
}));

const mockAnalyzeTutor = analyzeTutor as jest.Mock;
const mockShowToast = showToast as jest.Mock;

const MOCK_RESPONSE = {
  corrected_text: "Hello, world!",
  errors: [],
  corrections: [],
  suggestions: [],
};

describe("useTutor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockAnalyzeTutor.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTutor("test input"));
    expect(result.current.loading).toBe(true);
    expect(result.current.response).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("sets response on successful API call", async () => {
    mockAnalyzeTutor.mockResolvedValue(MOCK_RESPONSE);
    const { result } = renderHook(() => useTutor("test input"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.response).toEqual(MOCK_RESPONSE);
    expect(result.current.error).toBeUndefined();
  });

  it("sets error message on API failure", async () => {
    mockAnalyzeTutor.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useTutor("test input"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.response).toBeUndefined();
    expect(result.current.error).toBe("Network error");
  });

  it("shows a toast on API failure", async () => {
    mockAnalyzeTutor.mockRejectedValue(new Error("Something went wrong"));
    renderHook(() => useTutor("test input"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Something went wrong" })
      );
    });
  });

  it("re-fetches when retry is called", async () => {
    mockAnalyzeTutor.mockResolvedValue(MOCK_RESPONSE);
    const { result } = renderHook(() => useTutor("test input"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(mockAnalyzeTutor).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(mockAnalyzeTutor).toHaveBeenCalledTimes(2);
    });
  });

  it("uses 'Network error. Check your connection.' as default error message", async () => {
    mockAnalyzeTutor.mockRejectedValue({ unexpected: true });
    const { result } = renderHook(() => useTutor("test"));

    await waitFor(() => {
      expect(result.current.error).toBe("Network error. Check your connection.");
    });
  });
});
