
import { createContext, useContext } from 'react';
import { AppContextType } from './types';

// Create context with null as initial value
const AppContext = createContext<AppContextType | null>(null);

// Custom hook to use the app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
