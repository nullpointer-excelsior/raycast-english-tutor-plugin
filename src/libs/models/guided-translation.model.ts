export type SourceLanguage = "english" | "spanish";

export interface GuidedTranslationModel {
  sourceLanguage: SourceLanguage;
  translation: string;
  vocabulary: string;
  verbTenses: string;
}

export interface TranslationOptions {
  enableVocabulary: boolean;
  enableVerbTenses: boolean;
}
