
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, Calendar, Users, Clock, BarChart, ArrowRight, LogIn } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/register');
    }, 300);
  };

  const handleLogin = () => {
    navigate('/login');
  };
  
  // Check if there's a household already registered
  const [hasRegisteredHousehold, setHasRegisteredHousehold] = useState(false);
  
  useEffect(() => {
    const savedState = localStorage.getItem('dogWalkAppState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setHasRegisteredHousehold(!!parsedState.householdName);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-primary/10 pt-20 pb-16 px-4 md:pt-28 md:pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <PawPrint size={16} className="mr-2" />
                <span>Family Dog Walker App</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Never Miss a <span className="text-primary">Dog Walk</span> Again
              </h1>
              
              <p className="text-lg text-gray-600 md:pr-8">
                PupWalkPal helps your family coordinate dog walks, track activity, and ensure your furry friend always gets the exercise they need.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {hasRegisteredHousehold ? (
                  <Button 
                    size="lg" 
                    onClick={handleLogin}
                    className="font-medium text-base"
                  >
                    <LogIn className="mr-2" size={18} />
                    Log In to Your Account
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      onClick={handleGetStarted}
                      disabled={isLoading}
                      className="font-medium text-base"
                    >
                      Get Started
                      {isLoading ? (
                        <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <ArrowRight className="ml-2" size={18} />
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleLogin}
                      className="font-medium text-base"
                    >
                      <LogIn className="mr-2" size={18} />
                      Log In
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-3xl transform rotate-3"></div>
              <img 
                src="/happy-dog-walk.jpg" 
                alt="Family walking dog" 
                className="relative z-10 rounded-3xl shadow-lg object-cover w-full h-[400px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1582456891925-a53965520520?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="hidden md:block absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything Your Family Needs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our all-in-one platform helps you coordinate dog walks between family members, track activity, and ensure your dog stays happy and healthy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Calendar className="text-primary" size={32} />}
              title="Schedule Walks"
              description="Create and manage walking schedules that work for the whole family."
            />
            <FeatureCard 
              icon={<Users className="text-primary" size={32} />}
              title="Family Coordination"
              description="Assign walks to family members and request cover when needed."
            />
            <FeatureCard 
              icon={<Clock className="text-primary" size={32} />}
              title="Track Activity"
              description="Log walk duration, routes, and your dog's bathroom breaks."
            />
            <FeatureCard 
              icon={<BarChart className="text-primary" size={32} />}
              title="Insights & Analytics"
              description="View statistics on walks, activity patterns, and family participation."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with PupWalkPal is easy and takes just a few minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number={1}
              title="Register Your Household"
              description="Create a household profile and add family members who will share dog walking responsibilities."
            />
            <StepCard 
              number={2}
              title="Add Your Dog's Details"
              description="Enter information about your dog including name, breed, age, and any special needs."
            />
            <StepCard 
              number={3}
              title="Create Walking Schedule"
              description="Set up a weekly schedule and assign walks to different family members."
            />
          </div>
          
          <div className="mt-16 text-center">
            {hasRegisteredHousehold ? (
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="font-medium text-base"
              >
                Log In Now
                <LogIn className="ml-2" size={18} />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="font-medium text-base"
              >
                Get Started Now
                <ArrowRight className="ml-2" size={18} />
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Happy Families, Happy Dogs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what other families are saying about PupWalkPal.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="PupWalkPal has been a game-changer for our busy family. Our dog Bella has never missed a walk since we started using it."
              author="The Johnson Family"
            />
            <TestimonialCard 
              quote="As a family of 5, we used to argue about whose turn it was to walk the dog. Now everyone knows their responsibilities!"
              author="The Martinez Family"
            />
            <TestimonialCard 
              quote="We've been able to track our dog's health better by seeing patterns in his walking habits. Fantastic app!"
              author="The Smith Family"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of families who have improved their dog walking routines with PupWalkPal.
            </p>
            
            {hasRegisteredHousehold ? (
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="font-medium text-base"
              >
                Log In to Your Account
                <LogIn className="ml-2" size={18} />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="font-medium text-base"
              >
                Register Your Family
                <ArrowRight className="ml-2" size={18} />
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <PawPrint size={24} className="text-primary mr-2" />
              <span className="text-xl font-bold">PupWalkPal</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © {new Date().getFullYear()} PupWalkPal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Step Card Component
const StepCard = ({ number, title, description }: { 
  number: number; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-primary font-bold text-xl">{number}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author }: { quote: string; author: string }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
      <p className="italic text-gray-700 mb-4">"{quote}"</p>
      <p className="font-medium text-primary">— {author}</p>
    </div>
  );
};

export default Landing;
