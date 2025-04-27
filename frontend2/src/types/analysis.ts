// src/types/analysis.ts

export interface DocumentAnalysis {
  plagiarismScore: number;        // Overall plagiarism percentage
  aiScore: number;               // Overall AI detection percentage
  textAnalysis: TextAnalysisResult;
  sourcesDetected: SourceMatch[];
  aiMarkers: AIMarker[];
  documentStats: DocumentStats;
}

export interface TextAnalysisResult {
  originalContent: number;       // Percentage of original content
  plagiarizedContent: number;    // Percentage of plagiarized content
  aiGeneratedContent: number;    // Percentage of AI-generated content
}

export interface SourceMatch {
  source: string;                // Source identifier (e.g., website name, document title)
  url: string;                   // URL of the matched source
  matchPercentage: number;       // Percentage match with this source
  snippets: string[];            // Matching text snippets
}

export interface AIMarker {
  type: string;                  // AI model type (e.g., 'GPT-4', 'Bard', 'Claude-2')
  confidence: number;            // Detection confidence percentage
  sections: string[];            // Sections of text flagged as AI-generated
}

export interface DocumentStats {
  wordCount: number;             // Total words in document
  characterCount: number;        // Total characters in document
  pageCount: number;             // Total pages (if applicable)
  readingTime: number;           // Estimated reading time in minutes
}

export type DocumentFormat = 'pdf' | 'docx' | 'txt' | 'md';  // Added markdown support