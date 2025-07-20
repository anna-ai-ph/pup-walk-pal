import { useApp } from '@/context/AppContext';
import { Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const WalkOverview = () => {
  const { state, getWalkerName, getMemberById, startWalk, requestWalkSwap } = useApp();
  const navigate = useNavigate();
  
  // Get today's upcoming walk for the current user
  const todaysWalk = state.walks.find(walk => {
    try {
      const today = new Date();
      const walkDate = walk.date instanceof Date ? walk.date : new Date(walk.date);
      
      return (
        walkDate.getDate() === today.getDate() &&
        walkDate.getMonth() === today.getMonth() &&
        walkDate.getFullYear() === today.getFullYear() &&
        walk.assignedTo === state.currentUser &&
        walk.status !== 'Completed'
      );
    } catch (error) {
      console.error('Error processing walk date:', error);
      return false;
    }
  });
  
  // If no walk found, check if other users have walks today
  const othersWalkToday = !todaysWalk && state.walks.some(walk => {
    try {
      const today = new Date();
      const walkDate = walk.date instanceof Date ? walk.date : new Date(walk.date);
      
      return (
        walkDate.getDate() === today.getDate() &&
        walkDate.getMonth() === today.getMonth() &&
        walkDate.getFullYear() === today.getFullYear() &&
        walk.assignedTo !== state.currentUser
      );
    } catch (error) {
      console.error('Error processing walk date:', error);
      return false;
    }
  });
  
  const handleStartWalk = () => {
    if (todaysWalk) {
      startWalk(todaysWalk.id);
      navigate('/walk-tracking');
    }
  };
  
  const handleRequestSwap = () => {
    if (todaysWalk) {
      requestWalkSwap(todaysWalk.id);
      toast.success("Swap request sent to all family members");
    }
  };
  
  // Format walk time (e.g., "8:00 AM")
  const formatWalkTime = (date: Date | string) => {
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting walk time:', error);
      return 'Invalid time';
    }
  };
  
  // If there's an active walk, direct to tracking
  if (state.currentWalk) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-primary/20 animate-enter">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-primary">Walk in Progress</h3>
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse-gentle"></div>
        </div>
        
        <Button 
          onClick={() => navigate('/walk-tracking')}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Continue Tracking
        </Button>
      </div>
    );
  }
  
  if (!todaysWalk) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-enter">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-500 text-sm flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
            Today's Walk
          </h3>
        </div>
        
        <div className="text-center py-3">
          <MapPin className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 font-medium">
            {othersWalkToday ? 
              "You don't have any walks assigned today" : 
              "No walks scheduled for today"
            }
          </p>
        </div>
      </div>
    );
  }
  
  const walker = getMemberById(todaysWalk.assignedTo);
  
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-enter">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-500 text-sm flex items-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
          Today's Walk
        </h3>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-lg">{getWalkerName(todaysWalk.assignedTo)}'s Turn</h4>
        <div className="flex items-center mt-1 text-sm text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>{formatWalkTime(todaysWalk.date)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Button 
          onClick={handleStartWalk}
          className="w-full"
        >
          Start Walk
        </Button>
        
        <Button 
          onClick={handleRequestSwap}
          variant="outline"
          className="w-full text-gray-600"
        >
          Request Swap
        </Button>
      </div>
    </div>
  );
};
