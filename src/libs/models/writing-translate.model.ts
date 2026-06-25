export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingTranslateResponse {
  original_text: string;
  english_translation: string;
  improved_writing: string;
  corrections: WritingCorrection[];
}
