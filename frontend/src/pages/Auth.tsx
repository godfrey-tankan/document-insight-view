
import { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>
            {isLogin ? <LoginForm /> : <SignUpForm />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
