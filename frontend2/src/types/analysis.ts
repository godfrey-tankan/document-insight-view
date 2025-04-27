
export interface DocumentAnalysis {
  plagiarismScore: number;
  aiScore: number;
  textAnalysis: TextAnalysisResult;
  sourcesDetected: SourceMatch[];
  aiMarkers: AIMarker[];
  documentStats: DocumentStats;
}

export interface TextAnalysisResult {
  originalContent: number; // percentage
  plagiarizedContent: number; // percentage
  aiGeneratedContent: number; // percentage
}

export interface SourceMatch {
  source: string;
  url: string;
  matchPercentage: number;
  snippets: string[];
}

export interface AIMarker {
  type: string; // e.g., 'GPT', 'Bard', 'Claude'
  confidence: number; // percentage
  sections: string[];
}

export interface DocumentStats {
  wordCount: number;
  characterCount: number;
  pageCount: number;
  readingTime: number; // minutes
}

export type DocumentFormat = 'pdf' | 'docx' | 'txt';
