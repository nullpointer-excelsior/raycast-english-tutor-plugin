import { buildTutorMarkdown, buildGuidedTranslationMarkdown } from "../libs/markdown";
import { TutorResponse } from "../libs/tutor-service";
import { GuidedTranslationModel } from "../libs/models/guided-translation.model";

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

const FULL_GUIDED: GuidedTranslationModel = {
  translation: "Hola, ¿cómo estás?",
  vocabulary: "how are you -> cómo estás",
  verbTenses: "Present simple",
};

const EMPTY_SECTIONS_GUIDED: GuidedTranslationModel = {
  translation: "Hola",
  vocabulary: "",
  verbTenses: "",
};

describe("buildGuidedTranslationMarkdown", () => {
  it("includes the translation and original sections", () => {
    const result = buildGuidedTranslationMarkdown(FULL_GUIDED, "Hello, how are you?");
    expect(result).toContain("# 🦜 Translation");
    expect(result).toContain("Hola, ¿cómo estás?");
    expect(result).toContain("**Original:** Hello, how are you?");
  });

  it("includes the vocabulary breakdown section when non-empty", () => {
    const result = buildGuidedTranslationMarkdown(FULL_GUIDED, "Hello");
    expect(result).toContain("## 📖 Vocabulary Breakdown");
    expect(result).toContain("how are you -> cómo estás");
  });

  it("includes the verb tenses section when non-empty", () => {
    const result = buildGuidedTranslationMarkdown(FULL_GUIDED, "Hello");
    expect(result).toContain("## ⏱ Verb Tenses");
    expect(result).toContain("Present simple");
  });

  it("omits empty analysis sections", () => {
    const result = buildGuidedTranslationMarkdown(EMPTY_SECTIONS_GUIDED, "Hello");
    expect(result).not.toContain("## 📖 Vocabulary Breakdown");
    expect(result).not.toContain("## ⏱ Verb Tenses");
    expect(result).toContain("# 🦜 Translation");
    expect(result).toContain("**Original:** Hello");
  });

  it("places the original marker after all analysis sections", () => {
    const result = buildGuidedTranslationMarkdown(FULL_GUIDED, "Hello");
    const translationIdx = result.indexOf("# 🦜 Translation");
    const originalIdx = result.indexOf("**Original:**");
    const vocabularyIdx = result.indexOf("## 📖 Vocabulary Breakdown");
    const verbTensesIdx = result.indexOf("## ⏱ Verb Tenses");
    expect(translationIdx).toBeLessThan(vocabularyIdx);
    expect(vocabularyIdx).toBeLessThan(verbTensesIdx);
    expect(verbTensesIdx).toBeLessThan(originalIdx);
  });
});
