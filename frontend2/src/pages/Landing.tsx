
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800">
            Detect Plagiarism & AI Content
            <span className="text-teal-600"> Instantly</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto">
            Our advanced AI-powered system helps you ensure content originality and detect AI-generated text with unmatched accuracy.
          </p>
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700 text-lg py-6 px-8"
            onClick={() => navigate('/signup')}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Why Choose DocuVerify?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Instant Results</h3>
              <p className="text-gray-600">Get detailed analysis reports in seconds, not minutes.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">99.9% Accuracy</h3>
              <p className="text-gray-600">Industry-leading accuracy in detecting both plagiarism and AI content.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Multiple Formats</h3>
              <p className="text-gray-600">Support for PDF, DOCX, and other popular document formats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
