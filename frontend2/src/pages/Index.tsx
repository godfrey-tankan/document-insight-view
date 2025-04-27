import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import DocumentUpload from '@/components/DocumentUpload';
import ResultsPanel from '@/components/ResultsPanel';
import Footer from '@/components/Footer';
import { DocumentAnalysis } from '@/types/analysis';
import { sampleAnalysis } from '@/utils/demoData';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('access_token') !== null;

    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAnalyzeDocument = (file: File) => {
    setIsAnalyzing(true);

    // Simulated analysis process
    toast({
      title: "Analysis Started",
      description: `Analyzing ${file.name}...`,
    });

    setTimeout(() => {
      // In a real application, this would be an API call
      setAnalysisResult(sampleAnalysis);
      setIsAnalyzing(false);

      toast({
        title: "Analysis Complete",
        description: "Your document has been analyzed successfully.",
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <Navbar />
      <Hero />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-6 space-y-8">
          <div className="max-w-3xl mx-auto">
            <DocumentUpload
              onAnalyze={handleAnalyzeDocument}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {analysisResult && !isAnalyzing && (
            <div className="mt-12 animate-fade-in">
              <ResultsPanel analysis={analysisResult} />
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-12 flex justify-center">
              <div className="p-8 text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-r-transparent mb-4"></div>
                <p className="text-teal-700 text-lg">Analyzing your document...</p>
                <p className="text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}

          {!analysisResult && !isAnalyzing && (
            <div className="mt-12 p-8 text-center bg-white rounded-xl shadow-lg max-w-3xl mx-auto">
              <h3 className="text-xl font-medium text-teal-700 mb-3">Ready to Analyze Your Document?</h3>
              <p className="text-gray-600">Upload a file above to check for plagiarism and AI-generated content.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
