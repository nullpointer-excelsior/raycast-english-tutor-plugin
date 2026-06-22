export interface GuidedTranslationModel {
  translation: string;
  vocabulary: string;
  verbTenses: string;
}

export interface TranslationOptions {
  enableVocabulary: boolean;
  enableVerbTenses: boolean;
}
