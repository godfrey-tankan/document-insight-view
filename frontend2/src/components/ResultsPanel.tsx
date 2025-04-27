import { useState } from 'react';
import { DocumentAnalysis, SourceMatch, AIMarker, DocumentStats } from '@/types/analysis';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ResultsPanelProps {
  analysis: DocumentAnalysis;
}

const ResultsPanel = ({ analysis }: ResultsPanelProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Original Content"
          value={`${analysis.textAnalysis.originalContent}%`}
          description="Unique, non-plagiarized content"
          colorClass="text-teal-600"
        />
        <StatCard
          title="Plagiarized Content"
          value={`${analysis.textAnalysis.plagiarizedContent}%`}
          description="Matched with existing sources"
          colorClass="text-red-600"
        />
        <StatCard
          title="AI Generated Content"
          value={`${analysis.textAnalysis.aiGeneratedContent}%`}
          description="Detected AI-generated text"
          colorClass="text-blue-600"
        />
      </div>

      {/* Detailed Analysis Sections */}
      <PlagiarismSection analysis={analysis} />
      <AIAnalysisSection analysis={analysis} />
      <DocumentStatsSection stats={analysis.documentStats} />
    </div>
  );
};

const PlagiarismSection = ({ analysis }: { analysis: DocumentAnalysis }) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold">Plagiarism Detection ({analysis.plagiarismScore}%)</h3>
    <Progress value={analysis.plagiarismScore} className="h-3" />

    {analysis.sourcesDetected.map((source, index) => (
      <SourceItem key={source.source} source={source} index={index} />
    ))}
  </div>
);

const AIAnalysisSection = ({ analysis }: { analysis: DocumentAnalysis }) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold">AI Detection Analysis ({analysis.aiScore}%)</h3>
    <Progress value={analysis.aiScore} className="h-3" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {analysis.aiMarkers.map((marker, index) => (
        <AIMarkerItem key={marker.type} marker={marker} index={index} />
      ))}
    </div>
  </div>
);

const DocumentStatsSection = ({ stats }: { stats: DocumentStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard
      title="Word Count"
      value={stats.wordCount.toLocaleString()}
      description="Total words in document"
    />
    <StatCard
      title="Characters"
      value={stats.characterCount.toLocaleString()}
      description="Including spaces"
    />
    <StatCard
      title="Pages"
      value={stats.pageCount.toString()}
      description="Approximate page count"
    />
    <StatCard
      title="Reading Time"
      value={`${stats.readingTime}m`}
      description="Average reading time"
    />
  </div>
);

// Reusable StatCard component
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

// Source Match Component
const SourceItem = ({ source, index }: { source: SourceMatch; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-medium">
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium">{source.source}</h4>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
              {source.url}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{source.matchPercentage}% Match</Badge>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide' : 'Show'} Snippets
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-2">
          {source.snippets.map((snippet, idx) => (
            <div key={idx} className="text-sm bg-gray-50 p-3 rounded border border-gray-100">
              "{snippet}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// AI Marker Component
const AIMarkerItem = ({ marker, index }: { marker: AIMarker; index: number }) => (
  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium">{marker.type}</h4>
      <Badge className={getAIConfidenceClass(marker.confidence)}>
        {marker.confidence}% Confidence
      </Badge>
    </div>
    <div className="text-sm text-gray-600 space-y-2">
      {marker.sections.slice(0, 2).map((section, idx) => (
        <p key={idx} className="truncate">"{section}"</p>
      ))}
      {marker.sections.length > 2 && (
        <p className="text-blue-600 text-sm">+ {marker.sections.length - 2} more sections</p>
      )}
    </div>
  </div>
);

const getAIConfidenceClass = (confidence: number) => {
  if (confidence > 85) return 'bg-red-100 text-red-700';
  if (confidence > 70) return 'bg-orange-100 text-orange-700';
  return 'bg-blue-100 text-blue-700';
};

export default ResultsPanel;