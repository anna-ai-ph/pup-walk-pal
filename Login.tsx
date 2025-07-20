
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PawPrint, LogIn, User } from 'lucide-react';
import { HouseholdMember } from '@/context/types';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, state } = useApp();
  const [householdName, setHouseholdName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [step, setStep] = useState<'household' | 'member'>('household');
  const [rememberMe, setRememberMe] = useState(false);
  
  useEffect(() => {
    sessionStorage.removeItem('lastLoginAttempt');
    
    // Check if we should restore from localStorage (rememberMe was true)
    const storedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(storedRememberMe);
    
    // Only redirect if user is already registered and not trying to log in again
    if (state.isRegistered) {
      navigate('/home');
    }
  }, [navigate, state.isRegistered]);
  
  const handleFirstStep = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!householdName || householdName.trim() === '') {
      toast.error('Please enter a household name');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('name', householdName);
      
      if (householdError) {
        throw new Error(householdError.message);
      }
      
      if (!households || households.length === 0) {
        toast.error('Household not found. Please check the name or register.');
        setIsLoading(false);
        return;
      }
      
      const householdId = households[0].id;
      const { data: householdMembers, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('household_id', householdId);
      
      if (membersError) {
        throw new Error(membersError.message);
      }
      
      if (!householdMembers || householdMembers.length === 0) {
        toast.error('No members found for this household.');
        setIsLoading(false);
        return;
      }
      
      const transformedMembers: HouseholdMember[] = householdMembers.map(member => {
        let achievementsArray: string[] = [];
        
        if (member.achievements) {
          if (Array.isArray(member.achievements)) {
            achievementsArray = member.achievements
              .map(item => String(item))
              .filter(item => item !== null && item !== undefined);
          }
        }
        
        return {
          id: member.id,
          name: member.name,
          email: member.email || undefined,
          profilePicture: member.profile_picture || undefined,
          role: member.role,
          walkCount: member.walk_count || 0,
          totalWalkDuration: member.total_walk_duration || 0,
          achievements: achievementsArray
        };
      });
      
      setMembers(transformedMembers);
      setStep('member');
      
    } catch (error) {
      console.error('Error finding household:', error);
      toast.error('Error finding household. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !selectedMember) {
      toast.error('Please select a family member and enter your password');
      return;
    }
    
    setIsLoading(true);
    
    sessionStorage.setItem('lastLoginAttempt', Date.now().toString());
    
    try {
      const success = await loginUser(householdName, password, selectedMember, rememberMe);
      
      if (success) {
        // Save rememberMe preference to localStorage
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        navigate('/home');
      } else {
        toast.error('Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <PawPrint size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Log in to manage your dog walking schedule</p>
        </div>
        
        <Card className="p-6">
          {step === 'household' ? (
            <form onSubmit={handleFirstStep}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="householdName" className="block text-sm font-medium mb-1">
                    Household Name
                  </label>
                  <Input
                    id="householdName"
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="Enter your household name"
                    required
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !householdName}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <span className="mr-2">Checking</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </div>
                  ) : (
                    <span>Continue</span>
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal text-primary"
                      onClick={() => navigate('/register')}
                    >
                      Register now
                    </Button>
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Select Family Member
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {members.map((member) => (
                      <Button
                        key={member.id}
                        type="button"
                        variant={selectedMember === member.id ? "default" : "outline"}
                        className="h-auto flex flex-col items-center justify-center p-4"
                        onClick={() => setSelectedMember(member.id)}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                          {member.profilePicture ? (
                            <img src={member.profilePicture} alt={member.name} className="rounded-full" />
                          ) : (
                            <User size={24} />
                          )}
                        </div>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-xs text-gray-500">{member.role}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Stay logged in
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !selectedMember || !password}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <span className="mr-2">Logging in</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In
                    </div>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setStep('household')}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
