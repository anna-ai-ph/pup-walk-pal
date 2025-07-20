
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WalkOverview } from '@/components/WalkOverview';
import { DogStatus } from '@/components/DogStatus';
import { AchievementCard } from '@/components/AchievementCard';

const Dashboard = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  
  // Redirect to registration if not registered
  useEffect(() => {
    if (!state.isRegistered) {
      navigate('/register');
    }
  }, [state.isRegistered, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 mt-16 mb-20 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">
          Hello, {state.members.find(m => m.id === state.currentUser)?.name || 'there'}!
        </h1>
        <p className="text-gray-500 mb-6 animation-delay-100">
          Here's what's happening with {state.dog.name} today.
        </p>
        
        <div className="space-y-4">
          <WalkOverview />
          <DogStatus />
          <AchievementCard />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
