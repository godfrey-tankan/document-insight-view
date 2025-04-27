
import { Link } from "react-router-dom";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-700">Create an account</h1>
            <p className="mt-2 text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
          <SignUpForm />
        </div>
      </main>
    </div>
  );
};

export default SignUp;
