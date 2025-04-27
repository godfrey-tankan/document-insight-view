
import { Button } from "@/components/ui/button";
import { FileText, Settings, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white border-b py-4 px-6 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-teal-600" />
          <span className="text-xl font-bold text-gray-800">DocuVerify</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">Home</a>
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">Dashboard</a>
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">History</a>
          <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors">About</a>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-teal-600 hover:bg-teal-50">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-teal-600 hover:bg-teal-50">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
