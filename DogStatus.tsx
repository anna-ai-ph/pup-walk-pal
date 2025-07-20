
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Smile, Meh, Clock, AlertCircle } from 'lucide-react';

export const DogStatus = () => {
  const { state } = useApp();
  
  // Get the most recent completed walk
  const completedWalks = state.walks
    .filter(walk => walk.status === 'Completed')
    .sort((a, b) => {
      if (!a.endTime || !b.endTime) return 0;
      return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
    });
  
  const lastWalk = completedWalks[0];
  
  const getMoodIcon = () => {
    if (!lastWalk?.dogMood) return <Meh className="text-gray-400" />;
    
    switch (lastWalk.dogMood) {
      case 'Happy':
        return <Smile className="text-green-500" />;
      case 'Calm':
        return <Meh className="text-blue-500" />;
      case 'Tired':
        return <Clock className="text-orange-500" />;
      case 'Stressed':
        return <AlertCircle className="text-red-500" />;
      default:
        return <Meh className="text-gray-400" />;
    }
  };
  
  const getMoodColor = () => {
    if (!lastWalk?.dogMood) return 'bg-gray-100';
    
    switch (lastWalk.dogMood) {
      case 'Happy':
        return 'bg-green-50';
      case 'Calm':
        return 'bg-blue-50';
      case 'Tired':
        return 'bg-orange-50';
      case 'Stressed':
        return 'bg-red-50';
      default:
        return 'bg-gray-100';
    }
  };
  
  const getLastWalkTime = () => {
    if (!lastWalk?.endTime) return 'No recent walks';
    
    const endTime = new Date(lastWalk.endTime);
    const now = new Date();
    const diffMs = now.getTime() - endTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return endTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-enter">
      <h3 className="font-medium text-gray-500 text-sm mb-3 flex items-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
        {state.dog.name}'s Status
      </h3>
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg">{lastWalk?.dogMood || 'Unknown'}</h4>
          <p className="text-sm text-gray-500">Last walk: {getLastWalkTime()}</p>
          
          {lastWalk?.activity && (
            <div className="flex gap-2 mt-2">
              {lastWalk.activity.peed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Peed
                </span>
              )}
              {lastWalk.activity.pooped && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brown-100 text-brown-800">
                  Pooped
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          getMoodColor()
        )}>
          {getMoodIcon()}
        </div>
      </div>
    </div>
  );
};
