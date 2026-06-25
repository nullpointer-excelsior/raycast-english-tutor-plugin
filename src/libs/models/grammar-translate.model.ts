export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface GrammarTranslateResponse {
  original_text: string;
  corrected_spanish: string;
  corrections: GrammarCorrection[];
  english_translation: string;
}
