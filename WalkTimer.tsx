
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Play, Pause, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WalkTimerProps = {
  onComplete: () => void;
};

export const WalkTimer = ({ onComplete }: WalkTimerProps) => {
  const { state } = useApp();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  
  useEffect(() => {
    if (!state.currentWalk?.startTime) return;
    
    // Calculate initial elapsed time directly from the server-stored start time
    const startTime = new Date(state.currentWalk.startTime);
    const initialElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    setElapsedTime(initialElapsed);
    setLastUpdated(Date.now());
    
    // Set up timer to update every second
    const timer = setInterval(() => {
      if (!isPaused) {
        // Recalculate elapsed time based on the start time each tick
        // This ensures accuracy even if the app was closed and reopened
        const startTimeMs = startTime.getTime();
        const currentElapsed = Math.floor((Date.now() - startTimeMs) / 1000);
        setElapsedTime(currentElapsed);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [state.currentWalk?.startTime, isPaused]);

  // Update the timer immediately when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.currentWalk?.startTime) {
        const startTime = new Date(state.currentWalk.startTime);
        const currentElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(currentElapsed);
        setLastUpdated(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [state.currentWalk?.startTime]);
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    
    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-primary/20 animate-enter">
      <h3 className="font-medium text-primary mb-3 flex items-center justify-between">
        <span>Walk in Progress</span>
        <span className={cn(
          "w-2 h-2 rounded-full bg-primary",
          isPaused ? "" : "animate-pulse-gentle"
        )}></span>
      </h3>
      
      <div className="flex items-center justify-center my-4">
        <div className="text-4xl font-bold text-gray-800">
          {formatTime(elapsedTime)}
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 flex items-center justify-center"
          onClick={togglePause}
        >
          {isPaused ? (
            <>
              <Play size={16} className="mr-1" /> Resume
            </>
          ) : (
            <>
              <Pause size={16} className="mr-1" /> Pause
            </>
          )}
        </Button>
        
        <Button
          className="flex-1 bg-primary hover:bg-primary/90 flex items-center justify-center"
          onClick={onComplete}
        >
          <StopCircle size={16} className="mr-1" /> End Walk
        </Button>
      </div>
    </div>
  );
};
