import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calendar, Clock, User, Clipboard, Lock, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { Walk } from '@/context/types';
import ScheduleEditor from '@/components/ScheduleEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Schedule = () => {
  const { state, getWalkerName, requestWalkSwap, confirmWalk, updateState } = useApp();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("view");
  
  useEffect(() => {
    if (!state.isRegistered) {
      navigate('/register');
    }
  }, [state.isRegistered, navigate]);
  
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      day: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      isToday: isSameDay(date, new Date()),
    };
  });
  
  const selectedDateWalks = state.walks.filter(walk => {
    const walkDate = new Date(walk.date);
    return (
      walkDate.getDate() === selectedDate.getDate() &&
      walkDate.getMonth() === selectedDate.getMonth() &&
      walkDate.getFullYear() === selectedDate.getFullYear()
    );
  });
  
  const handleRequestSwap = (walkId: string) => {
    // Get walk details to show in confirmation
    const walk = state.walks.find(w => w.id === walkId);
    if (walk) {
      const walkDate = new Date(walk.date);
      const formattedDate = walkDate.toLocaleDateString();
      const formattedTime = walkDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      // The confirmation dialog is now moved to the AppProvider for better UX
      requestWalkSwap(walkId);
    } else {
      toast.error("Could not find walk information");
    }
  };

  const handleConfirmWalk = (walkId: string) => {
    confirmWalk(walkId);
  };
  
  const formatWalkTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const isWalkConfirmed = (walk: Walk) => {
    return walk.status === 'Confirmed';
  };

  const handleSaveWalks = (updatedWalks: Walk[]) => {
    console.log("Saving walks:", updatedWalks.length);
    updateState({ walks: updatedWalks });
    toast.success("Schedule updated successfully");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 mt-16 mb-20">
        <h1 className="text-2xl font-bold mb-1 animate-enter">
          Walking Schedule
        </h1>
        <p className="text-gray-500 mb-6 animate-enter animation-delay-100">
          View and manage upcoming dog walks for your household.
        </p>
        
        <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="view">View Schedule</TabsTrigger>
            <TabsTrigger value="edit">Edit Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="mb-4">
                <h2 className="font-semibold mb-3 flex items-center">
                  <Calendar size={18} className="mr-2 text-primary" />
                  Weekly Overview
                </h2>
                <div className="flex overflow-x-auto pb-2 -mx-1 scrollbar-none">
                  {weekDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-full mx-1 transition-colors ${
                        isSameDay(day.date, selectedDate)
                          ? 'bg-primary text-white'
                          : day.isToday
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xs font-medium">{day.day}</span>
                      <span className="text-lg font-bold">{day.dayOfMonth}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold mb-4">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              
              {selectedDateWalks.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateWalks.map((walk) => {
                    const confirmed = walk.status === 'Confirmed';
                    const swapRequested = walk.status === 'Swap Requested';
                    return (
                      <div 
                        key={walk.id} 
                        className={`relative p-4 rounded-lg border ${
                          walk.status === 'Completed' 
                            ? 'border-green-100 bg-green-50' 
                            : walk.status === 'In Progress'
                            ? 'border-primary/20 bg-primary/5'
                            : swapRequested
                            ? 'border-blue-100 bg-blue-50'
                            : confirmed
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <Clock size={16} className="mr-2 text-gray-500" />
                              <span className="font-medium">
                                {formatWalkTime(walk.date)}
                              </span>
                              {walk.status === 'Completed' && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Completed
                                </span>
                              )}
                              {walk.status === 'In Progress' && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full animate-pulse-gentle">
                                  In Progress
                                </span>
                              )}
                              {swapRequested && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                  <ArrowRight size={10} className="mr-1" />
                                  Swap Requested
                                </span>
                              )}
                              {confirmed && (
                                <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center">
                                  <Lock size={10} className="mr-1" />
                                  Confirmed
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-2 flex items-center">
                              <User size={16} className="mr-2 text-gray-500" />
                              <span>{getWalkerName(walk.assignedTo)}</span>
                            </div>
                            
                            {walk.duration && (
                              <div className="mt-2 flex items-center">
                                <Clipboard size={16} className="mr-2 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {walk.duration} minutes
                                  {walk.activity?.peed && " • Peed"}
                                  {walk.activity?.pooped && " • Pooped"}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            {walk.status === 'Not Started' && walk.assignedTo === state.currentUser && !confirmed && !swapRequested && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRequestSwap(walk.id)}
                                  className="text-xs bg-white"
                                >
                                  Request Swap
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleConfirmWalk(walk.id)}
                                  className="text-xs bg-white"
                                >
                                  Confirm & Lock
                                </Button>
                              </>
                            )}
                            
                            {swapRequested && walk.swapRequestedBy === state.currentUser && (
                              <div className="text-xs text-blue-500 flex items-center p-2 bg-blue-50 rounded-md">
                                <Info size={12} className="mr-1" />
                                Swap requested
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-lg">
                  <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500">No walks scheduled for this day</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Select a different date to view walks
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={() => setActiveTab("edit")} className="w-full md:w-auto">
                Edit Walking Schedule
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edit">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold mb-4">Edit Schedule</h2>
              <ScheduleEditor
                walks={state.walks}
                members={state.members}
                onSave={handleSaveWalks}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
