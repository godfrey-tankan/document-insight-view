import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentAnalysis } from '@/types/analysis';
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


// Update the worker URL to match 3.4.120
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

const ResultsPanel = ({ analysis }: { analysis?: DocumentAnalysis }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [numPages, setNumPages] = useState(0);
  const [pageDimensions, setPageDimensions] = useState<{
    [key: number]: { width: number, height: number }
  }>({});

  // Safe defaults with actual data structure
  const safeAnalysis = analysis || {
    plagiarismScore: 0,
    aiScore: 0,
    documentStats: {
      wordCount: 0,
      characterCount: 0,
      pageCount: 0,
      readingTime: 0
    },
    highlights: [],
    fileUrl: '',
    content: ''
  };

  // Chart data
  const chartData = [
    { name: 'Original', value: 100 - safeAnalysis.plagiarismScore },
    { name: 'Plagiarized', value: safeAnalysis.plagiarismScore },
    { name: 'AI Generated', value: safeAnalysis.aiScore }
  ];

  const handlePageLoad = (page: any, index: number) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPageDimensions(prev => ({ ...prev, [index + 1]: { width, height } }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="stats">Statistics View</TabsTrigger>
          <TabsTrigger value="text">Document View</TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Original Content"
                value={`${100 - safeAnalysis.plagiarismScore}%`}
                colorClass="text-green-600"
                description="Unique content percentage"
              />
              <StatCard
                title="Plagiarized Content"
                value={`${safeAnalysis.plagiarismScore}%`}
                colorClass="text-red-600"
                description="Matched with existing sources"
              />
              <StatCard
                title="AI Generated"
                value={`${safeAnalysis.aiScore}%`}
                colorClass="text-yellow-600"
                description="Probability of AI generation"
              />
            </div>

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
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-64">
                <h3 className="text-xl font-semibold mb-4">Risk Scores</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Plagiarism', score: safeAnalysis.plagiarismScore },
                    { name: 'AI', score: safeAnalysis.aiScore }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar dataKey="score" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Word Count"
                value={safeAnalysis.documentStats.wordCount.toLocaleString()}
                description="Total words in document"
              />
              <StatCard
                title="Characters"
                value={safeAnalysis.documentStats.characterCount.toLocaleString()}
                description="Including spaces"
              />
              <StatCard
                title="Pages"
                value={safeAnalysis.documentStats.pageCount.toString()}
                description="Approximate count"
              />
              <StatCard
                title="Reading Time"
                value={`${safeAnalysis.documentStats.readingTime}m`}
                description="Average reading time"
              />
            </div>
          </div>
        </TabsContent>

        {/* Document View Tab */}
        <TabsContent value="text">
          <div className="space-y-4">
            {safeAnalysis.fileUrl ? (
              <Document
                file={safeAnalysis.fileUrl}
                onLoadError={(error) => console.error('PDF load error:', error)}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="border rounded-lg"
              >
                {Array.from({ length: numPages }, (_, index) => (
                  <div key={`page_${index + 1}`} className="relative my-4">
                    <Page
                      pageNumber={index + 1}
                      width={pageDimensions[index + 1]?.width || 800}
                      onLoadSuccess={(page) => handlePageLoad(page, index)}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                    {/* Add highlight overlays here */}
                  </div>
                ))}
              </Document>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No document preview available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// StatCard component
const StatCard = ({ title, value, description, colorClass = "text-gray-800" }: {
  title: string;
  value: string;
  description: string;
  colorClass?: string;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-2xl font-bold mt-2 ${colorClass}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

export default ResultsPanel;