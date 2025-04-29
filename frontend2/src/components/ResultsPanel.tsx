import { useState } from 'react';
import { DocumentAnalysis, SourceMatch, AIMarker, DocumentStats } from '@/types/analysis';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlagiarismSection from './PlagiarismSection';
import AIAnalysisSection from './AIAnalysisSection';

interface ResultsPanelProps {
  analysis?: DocumentAnalysis;
}

const ResultsPanel = ({ analysis }: ResultsPanelProps) => {
  // Safe defaults with proper initial values
  const safeAnalysis = analysis || {
    textAnalysis: {
      originalContent: 0,
      plagiarizedContent: 0,
      aiGeneratedContent: 0
    },
    plagiarismScore: 0,
    aiScore: 0,
    sourcesDetected: [],
    aiMarkers: [],
    documentStats: {
      word_count: 0,
      character_count: 0,
      page_count: 0,
      reading_time: 0
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Original Content"
          value={`${safeAnalysis.plagiarismScore}%`}
          description="Unique, non-plagiarized content"
          colorClass="text-teal-600"
        />
        <StatCard
          title="Plagiarized Content"
          value={`${safeAnalysis.textAnalysis.plagiarizedContent}%`}
          description="Matched with existing sources"
          colorClass="text-red-600"
        />
        <StatCard
          title="AI Generated Content"
          value={`${safeAnalysis.textAnalysis.aiGeneratedContent}%`}
          description="Detected AI-generated text"
          colorClass="text-blue-600"
        />
      </div>

      {/* Detailed Analysis Sections */}
      <PlagiarismSection analysis={safeAnalysis} />
      <AIAnalysisSection analysis={safeAnalysis} />
      <DocumentStatsSection stats={safeAnalysis.documentStats} />
    </div>
  );
};

// Helper function to convert snake_case to camelCase
const convertStats = (stats: DocumentStats) => ({
  wordCount: stats.word_count || stats.wordCount || 0,
  characterCount: stats.character_count || stats.characterCount || 0,
  pageCount: stats.page_count || stats.pageCount || 0,
  readingTime: stats.reading_time || stats.readingTime || 0
});

const DocumentStatsSection = ({ stats }: { stats?: DocumentStats }) => {
  const safeStats = convertStats(stats || {});

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Word Count"
        value={safeStats.wordCount.toLocaleString()}
        description="Total words in document"
      />
      <StatCard
        title="Characters"
        value={safeStats.characterCount.toLocaleString()}
        description="Including spaces"
      />
      <StatCard
        title="Pages"
        value={safeStats.pageCount.toString()}
        description="Approximate page count"
      />
      <StatCard
        title="Reading Time"
        value={`${safeStats.readingTime}m`}
        description="Average reading time"
      />
    </div>
  );
};

// StatCard component remains visually identical with safety checks
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  colorClass?: string;
}

const StatCard = ({ title, value, description, colorClass = "text-gray-800" }: StatCardProps) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

// SourceItem with visual preservation and safety
const SourceItem = ({ source, index }: { source: SourceMatch; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSnippets = (source.snippets?.length || 0) > 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-medium">
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium">{source.source || 'Unknown Source'}</h4>
            {source.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                {source.url || 'No URL available'}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{source.matchPercentage ?? 0}% Match</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            disabled={!hasSnippets}
          >
            {expanded ? 'Hide' : 'Show'} Snippets
          </Button>
        </div>
      </div>

      {expanded && hasSnippets && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-2">
          {source.snippets?.map((snippet, idx) => (
            <div key={idx} className="text-sm bg-gray-50 p-3 rounded border border-gray-100">
              "{snippet || 'No text available'}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// AIMarkerItem with visual preservation and safety
const AIMarkerItem = ({ marker, index }: { marker: AIMarker; index: number }) => {
  const sections = marker.sections || [];
  const confidence = marker.confidence ?? 0;

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{marker.type || `AI Marker ${index + 1}`}</h4>
        <Badge className={getAIConfidenceClass(confidence)}>
          {confidence}% Confidence
        </Badge>
      </div>
      <div className="text-sm text-gray-600 space-y-2">
        {sections.slice(0, 2).map((section, idx) => (
          <p key={idx} className="truncate">"{section || 'No content'}"</p>
        ))}
        {sections.length > 2 && (
          <p className="text-blue-600 text-sm">+ {sections.length - 2} more sections</p>
        )}
      </div>
    </div>
  );
};

const getAIConfidenceClass = (confidence: number) => {
  if (confidence > 85) return 'bg-red-100 text-red-700';
  if (confidence > 70) return 'bg-orange-100 text-orange-700';
  return 'bg-blue-100 text-blue-700';
};

export default ResultsPanel;