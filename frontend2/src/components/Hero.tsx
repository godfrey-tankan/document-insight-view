
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-white-600 to-teal-700 text-black py-16">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="flex flex-col w-full md:w-1/2 justify-center items-start py-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Detect Plagiarism & AI Content with Precision
          </h1>
          <p className="leading-normal text-xl mb-8">
            Our advanced analysis tools help you identify plagiarized content and AI-generated text with industry-leading accuracy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start w-full">
            <Button
              className="py-6 px-8 bg-teal-700 text-white hover:bg-teal-600 rounded-lg font-bold mb-4 sm:mb-0 sm:mr-4"
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Analyze Document
            </Button>
            <Button
              className="py-6 px-8 bg-teal-700 text-white hover:bg-teal-600 rounded-lg font-bold mb-4 sm:mb-0 sm:mr-4"
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 py-6 flex justify-center">
          <div className="h-64 w-full md:w-4/5 bg-white bg-opacity-10 rounded-xl backdrop-filter backdrop-blur-md border border-white border-opacity-20 shadow-2xl flex items-center justify-center animate-slide-up">
            <div className="p-8 text-center">
              <div className="text-5xl font-bold mb-4 text-teal-600">99.8%</div>
              <p className="text-lg">Detection Accuracy</p>
            </div>
            <div className="border-r border-white border-opacity-20 h-20 mx-6"></div>
            <div className="p-8 text-center">
              <div className="text-5xl font-bold mb-4 text-teal-600">3M+</div>
              <p className="text-lg">Documents Analyzed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
