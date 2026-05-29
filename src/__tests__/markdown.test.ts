import { buildTutorMarkdown } from "../libs/markdown";
import { TutorResponse } from "../libs/tutor-service";

const FULL_RESPONSE: TutorResponse = {
  corrected_text: "Hello, how are you?",
  errors: ["Missing comma after 'Hello'", "Wrong verb tense"],
  corrections: ["Added comma", "Changed verb tense"],
  suggestions: ["Consider a more formal greeting"],
};

const EMPTY_ARRAYS_RESPONSE: TutorResponse = {
  corrected_text: "This is correct.",
  errors: [],
  corrections: [],
  suggestions: [],
};

describe("buildTutorMarkdown", () => {
  it("includes the corrected text section", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    expect(result).toContain("## ✅ Corrected Text");
    expect(result).toContain("Hello, how are you?");
  });

  it("includes the errors section with list items", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    expect(result).toContain("## ❌ Errors");
    expect(result).toContain("- Missing comma after 'Hello'");
    expect(result).toContain("- Wrong verb tense");
  });

  it("includes the corrections section with list items", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    expect(result).toContain("## 📝 Corrections");
    expect(result).toContain("- Added comma");
    expect(result).toContain("- Changed verb tense");
  });

  it("includes the suggestions section with list items", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    expect(result).toContain("## 💡 Suggestions");
    expect(result).toContain("- Consider a more formal greeting");
  });

  it("renders 'None' when arrays are empty", () => {
    const result = buildTutorMarkdown(EMPTY_ARRAYS_RESPONSE);
    expect(result).toContain("## ❌ Errors\nNone");
    expect(result).toContain("## 📝 Corrections\nNone");
    expect(result).toContain("## 💡 Suggestions\nNone");
  });

  it("sections are separated by double newlines", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    const sections = result.split("\n\n");
    expect(sections.length).toBe(4);
  });
});
