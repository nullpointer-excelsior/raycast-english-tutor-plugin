import { createOpenAIClient } from "../libs/openai-client";
import { getPreferenceValues } from "@raycast/api";
import OpenAI from "openai";

jest.mock("openai");

describe("createOpenAIClient", () => {
  it("creates an OpenAI client using the preference API key", () => {
    (getPreferenceValues as jest.Mock).mockReturnValue({ openaiApiKey: "sk-test-123" });
    const client = createOpenAIClient();
    expect(client).toBeInstanceOf(OpenAI);
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: "sk-test-123" });
  });

  it("calls getPreferenceValues to retrieve the API key", () => {
    (getPreferenceValues as jest.Mock).mockReturnValue({ openaiApiKey: "sk-another-key" });
    createOpenAIClient();
    expect(getPreferenceValues).toHaveBeenCalled();
  });
});
