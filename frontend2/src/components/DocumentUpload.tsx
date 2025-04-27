
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { DocumentFormat } from '@/types/analysis';
import { useToast } from '@/components/ui/use-toast';

interface DocumentUploadProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

const DocumentUpload = ({ onAnalyze, isAnalyzing }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const acceptedFormats = '.pdf,.docx,.doc,.txt';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleFileChange(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['pdf', 'docx', 'doc', 'txt'];
    
    if (!validExtensions.includes(extension)) {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF, DOCX, DOC, or TXT file.",
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleFileChange(file);
      }
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    } else {
      toast({
        title: "No file selected",
        description: "Please select a document to analyze.",
        variant: "destructive"
      });
    }
  };

  const getFileFormatIcon = () => {
    if (!selectedFile) return null;
    
    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    let color;
    let format: string;
    
    switch (extension) {
      case 'pdf':
        color = 'text-red-500';
        format = 'PDF';
        break;
      case 'docx':
      case 'doc':
        color = 'text-blue-500';
        format = 'DOCX';
        break;
      case 'txt':
        color = 'text-gray-500';
        format = 'TXT';
        break;
      default:
        color = 'text-gray-500';
        format = 'DOC';
    }
    
    return (
      <div className={`flex items-center ${color}`}>
        <FileFormat format={format as DocumentFormat} />
        <span className="ml-2 text-sm">{format}</span>
      </div>
    );
  };

  return (
    <div id="upload-section" className="bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-teal-800 mb-6">Upload Document</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
        } transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-teal-500 mb-4" />
        <p className="mb-2 text-gray-700">
          Drag and drop your document here, or{' '}
          <label className="text-teal-600 font-medium cursor-pointer hover:underline">
            browse
            <input 
              type="file" 
              className="sr-only" 
              accept={acceptedFormats} 
              onChange={handleFileInput} 
            />
          </label>
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF, DOCX, DOC, and TXT files (max 20MB)
        </p>
      </div>
      
      {selectedFile && (
        <div className="mt-4 p-3 bg-teal-50 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            {getFileFormatIcon()}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button 
            variant="default" 
            className="bg-dashboard-primary hover:bg-teal-700"
            disabled={isAnalyzing}
            onClick={handleAnalyzeClick}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      )}
    </div>
  );
};

interface FileFormatProps {
  format: DocumentFormat;
}

const FileFormat = ({ format }: FileFormatProps) => {
  let bgColor;
  
  switch (format) {
    case 'pdf':
      bgColor = 'bg-red-100';
      break;
    case 'docx':
      bgColor = 'bg-blue-100';
      break;
    case 'txt':
      bgColor = 'bg-gray-100';
      break;
  }
  
  return (
    <div className={`${bgColor} rounded p-1 text-xs font-bold`}>
      {format}
    </div>
  );
};

export default DocumentUpload;
