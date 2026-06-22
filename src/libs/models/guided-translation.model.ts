export interface GuidedTranslationModel {
  translation: string;
  vocabulary: string;
  verbTenses: string;
  alternatives: string;
}

export interface TranslationOptions {
  enableVocabulary: boolean;
  enableVerbTenses: boolean;
  enableAlternatives: boolean;
}
