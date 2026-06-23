/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { showToast } from "@raycast/api";
import { useAsyncResource } from "../hooks/useAsyncResource";
import { classifyOpenAIError, DEFAULT_NETWORK_ERROR_MESSAGE } from "../libs/openai-errors";
import { APIError } from "openai";

jest.mock("@raycast/api");

const mockShowToast = showToast as jest.Mock;

describe("useAsyncResource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    const factory = jest.fn(() => new Promise<string>(() => {}));
    const { result } = renderHook(() => useAsyncResource(factory));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("sets data on resolved factory", async () => {
    const factory = jest.fn().mockResolvedValue("result");
    const { result } = renderHook(() => useAsyncResource(factory));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe("result");
    expect(result.current.error).toBeUndefined();
  });

  it("sets error and shows a toast on rejected factory using the default mapError", async () => {
    const factory = jest.fn().mockRejectedValue(new Error("Something went wrong"));
    const { result } = renderHook(() => useAsyncResource(factory));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Something went wrong");
    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Something went wrong" }));
  });

  it("uses a custom mapError override", async () => {
    const factory = jest.fn().mockRejectedValue(new Error("Original error"));
    const { result } = renderHook(() => useAsyncResource(factory, [], { mapError: () => "Custom error" }));

    await waitFor(() => {
      expect(result.current.error).toBe("Custom error");
    });
  });

  it("suppresses the toast when showErrorToast is false", async () => {
    const factory = jest.fn().mockRejectedValue(new Error("Silent error"));
    const { result } = renderHook(() => useAsyncResource(factory, [], { showErrorToast: false }));

    await waitFor(() => {
      expect(result.current.error).toBe("Silent error");
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("re-invokes the factory when retry is called", async () => {
    const factory = jest.fn().mockResolvedValue("result");
    const { result } = renderHook(() => useAsyncResource(factory));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(factory).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  it("falls back to the default network error message for non-Error rejections", async () => {
    const factory = jest.fn().mockRejectedValue({ unexpected: true });
    const { result } = renderHook(() => useAsyncResource(factory));

    await waitFor(() => {
      expect(result.current.error).toBe(DEFAULT_NETWORK_ERROR_MESSAGE);
    });
  });

  it("re-invokes the factory when a dependency changes without calling retry", async () => {
    const factory = jest.fn().mockResolvedValue("result");
    const { result, rerender } = renderHook(({ dep }) => useAsyncResource(factory, [dep]), {
      initialProps: { dep: "first" },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ dep: "second" });

    await waitFor(() => {
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  it("uses classifyOpenAIError as mapError to special-case a 401 APIError", async () => {
    const err = new APIError(401, { message: "bad" }, undefined, undefined);
    const factory = jest.fn().mockRejectedValue(err);
    const { result } = renderHook(() => useAsyncResource(factory, [], { mapError: classifyOpenAIError }));

    await waitFor(() => {
      expect(result.current.error).toBe("Invalid OpenAI API Key. Check your preferences.");
    });
  });
});
