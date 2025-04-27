
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpCredentials } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/lib/api";
import Loader from "@/components/Loader.jsx";

const SignUpForm = () => {
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credentials.password !== credentials.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await registerUser(credentials);

      if (response.status === 201) {
        toast({
          title: "Signup Successful",
          description: "Please Login!",
        });
        return;
      }

      // If server returns 400 but does not throw (not typical with Axios)
      if (response.status === 400) {
        toast({
          title: "Signup Failed",
          description: "User already exists",
          variant: "destructive",
        });
        return;
      }

      throw new Error('Unexpected response status');

    } catch (err) {
      let errorMessage = 'Signup failed. Please check your Form.';

      if (err.response) {
        const status = err.response.status;

        if (status === 400) {
          toast({
            title: "Signup Failed",
            description: "User already exists",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        errorMessage = err.response.data.detail || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center ">Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={credentials.name}
              onChange={(e) =>
                setCredentials({ ...credentials, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={credentials.confirmPassword}
              onChange={(e) =>
                setCredentials({ ...credentials, confirmPassword: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 uppercase"
          >
            {isLoading ? <Loader size="small" /> : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
