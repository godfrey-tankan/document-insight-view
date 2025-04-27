
import { DocumentAnalysis } from "../types/analysis";

export const sampleAnalysis: DocumentAnalysis = {
  plagiarismScore: 18,
  aiScore: 42,
  textAnalysis: {
    originalContent: 40,
    plagiarizedContent: 18,
    aiGeneratedContent: 42
  },
  sourcesDetected: [
    {
      source: "Academic Journal of AI Ethics",
      url: "https://example.com/journal",
      matchPercentage: 8.5,
      snippets: [
        "The ethical implications of artificial intelligence in modern society cannot be overstated...",
        "Researchers have found that algorithmic bias can perpetuate existing social inequalities..."
      ]
    },
    {
      source: "Technical Documentation Repository",
      url: "https://example.com/docs",
      matchPercentage: 6.2,
      snippets: [
        "The implementation follows standard protocols for data processing and validation...",
        "System architecture includes three primary components working in tandem..."
      ]
    },
    {
      source: "Wikipedia: Machine Learning",
      url: "https://en.wikipedia.org/wiki/Machine_learning",
      matchPercentage: 3.3,
      snippets: [
        "Machine learning approaches are traditionally divided into supervised, unsupervised, and reinforcement learning..."
      ]
    },
  ],
  aiMarkers: [
    {
      type: "GPT-4",
      confidence: 87.2,
      sections: [
        "Introduction",
        "Literature Review",
        "Conclusion"
      ]
    },
    {
      type: "Bard",
      confidence: 12.6,
      sections: [
        "Methodology"
      ]
    }
  ],
  documentStats: {
    wordCount: 4285,
    characterCount: 24680,
    pageCount: 12,
    readingTime: 17
  }
};
