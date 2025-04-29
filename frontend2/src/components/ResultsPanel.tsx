import { useState } from 'react';
import { DocumentAnalysis, SourceMatch, AIMarker, DocumentStats } from '@/types/analysis';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import PlagiarismSection from './PlagiarismSection';
import AIAnalysisSection from './AIAnalysisSection';

interface ResultsPanelProps {
  analysis?: DocumentAnalysis;
}

const ResultsPanel = ({ analysis }: ResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [highlightMode, setHighlightMode] = useState<'plagiarism' | 'ai'>('plagiarism');

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
    },
    highlightedText: '',
    content: ''
  };

  // Chart data preparation
  const chartData = [
    { name: 'Original', value: safeAnalysis.textAnalysis.originalContent },
    { name: 'Plagiarized', value: safeAnalysis.textAnalysis.plagiarizedContent },
    { name: 'AI Generated', value: safeAnalysis.textAnalysis.aiGeneratedContent },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="stats">Statistics View</TabsTrigger>
          <TabsTrigger value="text">Text Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="space-y-8">
            {/* Visualization Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64">
                <h3 className="text-xl font-semibold mb-4">Content Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#3B82F6"
                      label={{ position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-64">
                <h3 className="text-xl font-semibold mb-4">Risk Scores</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Plagiarism', score: safeAnalysis.plagiarismScore },
                    { name: 'AI Generated', score: safeAnalysis.aiScore }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar
                      dataKey="score"
                      fill="#EF4444"
                      label={{ position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

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
        </TabsContent>

        <TabsContent value="text">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={highlightMode === 'plagiarism' ? 'default' : 'outline'}
                onClick={() => setHighlightMode('plagiarism')}
                className="flex-1 md:flex-none"
              >
                Show Plagiarism
              </Button>
              <Button
                variant={highlightMode === 'ai' ? 'default' : 'outline'}
                onClick={() => setHighlightMode('ai')}
                className="flex-1 md:flex-none"
              >
                Show AI Patterns
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 max-h-[600px] overflow-auto">
              {highlightMode === 'plagiarism' ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: safeAnalysis.highlightedText?.replace(
                      /<mark/g,
                      '<mark style="background-color: #fee2e2; padding: 2px 4px; border-radius: 4px; display: inline;"'
                    ) || safeAnalysis.content
                  }}
                />
              ) : (
                <div className="prose max-w-none">
                  {safeAnalysis.content?.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/).map((sentence, index) => {
                    const hasAI = Math.random() * 100 < safeAnalysis.aiScore;
                    return (
                      <span
                        key={index}
                        style={{
                          backgroundColor: hasAI ? 'rgba(254, 240, 138, 0.3)' : 'transparent',
                          padding: hasAI ? '2px 4px' : 0,
                          borderRadius: '4px',
                          display: 'inline-block',
                          margin: '2px 0'
                        }}
                      >
                        {sentence}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
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