
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10 px-4">
      <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <PawPrint size={28} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
