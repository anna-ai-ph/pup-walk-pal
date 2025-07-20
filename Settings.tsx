import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  User, 
  Dog, 
  Users, 
  LogOut, 
  Moon, 
  Bell, 
  Sun, 
  ChevronRight,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { HouseholdMember } from '@/context/types';
import ScheduleEditor from '@/components/ScheduleEditor';

const Settings = () => {
  const { state, updateState, logoutUser } = useApp();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  
  useEffect(() => {
    if (!state.isRegistered) {
      navigate('/');
    }
  }, [state.isRegistered, navigate]);
  
  const switchUser = (userId: string) => {
    updateState({ currentUser: userId });
  };
  
  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };
  
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSaveWalks = (updatedWalks) => {
    updateState({ walks: updatedWalks });
    setShowScheduleEditor(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 mt-16 mb-20">
        <h1 className="text-2xl font-bold mb-1 animate-enter">
          Settings
        </h1>
        <p className="text-gray-500 mb-6 animate-enter animation-delay-100">
          Manage your account and preferences
        </p>
        
        <div className="space-y-4">
          {showScheduleEditor ? (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center">
                  <Calendar size={18} className="mr-2 text-primary" />
                  Edit Walking Schedule
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowScheduleEditor(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <ScheduleEditor 
                walks={state.walks}
                members={state.members}
                onSave={handleSaveWalks}
              />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold mb-4 flex items-center">
                  <User size={18} className="mr-2 text-primary" />
                  Your Profile
                </h2>
                
                {state.members.map((member: HouseholdMember) => (
                  member.id === state.currentUser && (
                    <div key={member.id} className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 text-xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{member.name}</h3>
                        <p className="text-gray-500">{member.role}</p>
                        <div className="mt-1 text-sm">
                          <span className="text-primary font-medium">{member.walkCount}</span> walks completed
                        </div>
                      </div>
                    </div>
                  )
                ))}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate('/profile')}
                  >
                    <span>Edit Profile</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold mb-4 flex items-center">
                  <Dog size={18} className="mr-2 text-primary" />
                  Dog Profile
                </h2>
                
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 text-2xl">
                    🐾
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{state.dog.name}</h3>
                    <p className="text-gray-500">{state.dog.breed}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {state.dog.age} years • {state.dog.weight} lbs
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate('/dog-profile')}
                  >
                    <span>Edit Dog Profile</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold mb-4 flex items-center">
                  <Calendar size={18} className="mr-2 text-primary" />
                  Walking Schedule
                </h2>
                
                <p className="text-gray-600 mb-4">
                  Manage your household's dog walking schedule
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setShowScheduleEditor(true)}
                >
                  <span>Edit Schedule</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold mb-4 flex items-center">
                  <Users size={18} className="mr-2 text-primary" />
                  Household Members
                </h2>
                
                <div className="space-y-3">
                  {state.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium">{member.name}</span>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      
                      {member.id !== state.currentUser && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => switchUser(member.id)}
                          className="text-xs"
                        >
                          Switch to
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate('/household')}
                  >
                    <span>Manage Household</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold mb-4">App Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell size={18} className="mr-3 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-gray-500">Manage notification settings</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate('/notifications')}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {darkMode ? (
                        <Moon size={18} className="mr-3 text-gray-500" />
                      ) : (
                        <Sun size={18} className="mr-3 text-gray-500" />
                      )}
                      <div>
                        <h3 className="font-medium">Dark Mode</h3>
                        <p className="text-sm text-gray-500">Toggle dark theme</p>
                      </div>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={handleToggleDarkMode}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HelpCircle size={18} className="mr-3 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Help & Support</h3>
                        <p className="text-sm text-gray-500">FAQs and contact</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate('/help')}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Log Out</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
