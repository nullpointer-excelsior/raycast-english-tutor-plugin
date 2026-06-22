import { buildTutorMarkdown, buildGuidedTranslationMarkdown } from "../libs/markdown";
import { TutorResponse } from "../libs/tutor-service";
import { GuidedTranslationModel } from "../libs/models/guided-translation.model";

const FULL_RESPONSE: TutorResponse = {
  corrected_text: "Hello, how are you?",
  corrections: [
    {
      original: "Hello how are you",
      corrected: "Hello, how are you?",
      explanation: "Use a comma after the greeting and a question mark at the end.",
    },
    {
      original: "is",
      corrected: "are",
      explanation: "Use the verb 'are' with the pronoun 'you'.",
    },
  ],
};

const EMPTY_CORRECTIONS_RESPONSE: TutorResponse = {
  corrected_text: "This is correct.",
  corrections: [],
};

describe("buildTutorMarkdown", () => {
  it("includes the corrected text section", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    expect(result).toContain("## ✅ Corrected Text");
    expect(result).toContain("Hello, how are you?");
  });

  it("includes the grammar and spelling corrections section", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    expect(result).toContain("## 📝 Grammar & Spelling Corrections");
    expect(result).toContain("Hello how are you");
    expect(result).toContain("Hello, how are you?");
    expect(result).toContain("Use a comma after the greeting");
  });

  it("renders a message when there are no corrections", () => {
    const result = buildTutorMarkdown(EMPTY_CORRECTIONS_RESPONSE);
    expect(result).toContain("## 📝 Grammar & Spelling Corrections");
    expect(result).toContain("No corrections needed.");
  });

  it("sections are separated by double newlines", () => {
    const result = buildTutorMarkdown(FULL_RESPONSE);
    const sections = result.split("\n\n");
    expect(sections.length).toBe(2);
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
