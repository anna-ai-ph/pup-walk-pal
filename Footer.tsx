
import { Home, Calendar, BarChart2, Settings, MapPin, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, getTodaysWalk } = useApp();
  
  // Try-catch to handle any potential errors with todaysWalk
  let todaysWalk = null;
  try {
    todaysWalk = getTodaysWalk();
  } catch (error) {
    console.error('Error getting today\'s walk:', error);
  }
  
  const isWalking = state.currentWalk !== null;
  
  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      path: '/',
      active: location.pathname === '/'
    },
    { 
      icon: Calendar, 
      label: 'Schedule', 
      path: '/schedule',
      active: location.pathname === '/schedule'
    },
    { 
      icon: MapPin, 
      label: 'Walk', 
      path: '/walk-tracking',
      active: location.pathname === '/walk-tracking' || isWalking,
      highlight: isWalking || (todaysWalk !== null && todaysWalk.status !== 'Completed')
    },
    { 
      icon: BarChart2, 
      label: 'Stats', 
      path: '/statistics',
      active: location.pathname === '/statistics'
    },
    { 
      icon: Bell, 
      label: 'Alerts', 
      path: '/notifications',
      active: location.pathname === '/notifications'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      active: location.pathname === '/settings'
    },
  ];
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
      <nav className="container mx-auto px-2">
        <ul className="flex items-center justify-between">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1">
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex flex-col items-center justify-center py-3 px-1",
                  "transition-colors hover:text-primary active-scale",
                  item.active ? "text-primary" : "text-gray-500",
                )}
              >
                <div className={cn(
                  "relative",
                  item.highlight && !item.active && "animate-pulse-gentle"
                )}>
                  <item.icon size={20} />
                  {item.highlight && !item.active && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
};
