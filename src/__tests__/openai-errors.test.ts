import { APIError } from "openai";
import {
  classifyOpenAIError,
  DEFAULT_NETWORK_ERROR_MESSAGE,
  INVALID_API_KEY_ERROR_MESSAGE,
} from "../libs/openai-errors";

function makeAPIError(status: number, message: string): APIError {
  return new APIError(status, { message }, undefined, undefined);
}

describe("classifyOpenAIError", () => {
  it("returns the invalid API key message for a 401 APIError", () => {
    const err = makeAPIError(401, "bad");
    expect(classifyOpenAIError(err)).toBe(INVALID_API_KEY_ERROR_MESSAGE);
  });

  it("returns the APIError message for other status codes", () => {
    const err = makeAPIError(500, "Internal server error");
    expect(classifyOpenAIError(err)).toBe(err.message);
  });

  it("returns the message for a plain Error", () => {
    const err = new Error("Something went wrong");
    expect(classifyOpenAIError(err)).toBe("Something went wrong");
  });

  it("falls back to the default network error message for non-Error values", () => {
    expect(classifyOpenAIError({ unexpected: true })).toBe(DEFAULT_NETWORK_ERROR_MESSAGE);
  });
});
