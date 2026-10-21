import { SourceLanguage } from "./guided-translation.model";

export interface TranslationResult {
  sourceLanguage: SourceLanguage;
  translation: string;
}
