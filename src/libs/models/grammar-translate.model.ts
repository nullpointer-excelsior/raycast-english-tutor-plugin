export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface GrammarTranslateResponse {
  original_text: string;
  english_translation: string;
  improved_writing: string;
  corrections: WritingCorrection[];
}
