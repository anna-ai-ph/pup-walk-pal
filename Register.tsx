
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { DogProfile, HouseholdMember } from '@/context/types';
import { PawPrint, PlusCircle, Trash2, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { registerHousehold } = useApp();
  
  const [householdName, setHouseholdName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dog, setDog] = useState<DogProfile>({
    name: '',
    age: 0,
    breed: '',
    weight: 0,
    specialNeeds: '',
  });
  
  const [members, setMembers] = useState<Array<Omit<HouseholdMember, 'walkCount' | 'totalWalkDuration' | 'achievements'>>>([
    {
      id: '1',
      name: '',
      email: '',
      profilePicture: '',
      role: 'Primary',
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const handleDogChange = (field: keyof DogProfile, value: string | number) => {
    setDog(prev => ({ ...prev, [field]: value }));
  };
  
  const handleMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
  };
  
  const addMember = () => {
    setMembers([
      ...members,
      {
        id: `${Date.now()}`, // Use timestamp for unique ID
        name: '',
        email: '',
        profilePicture: '',
        role: 'Secondary',
      }
    ]);
  };
  
  const removeMember = (index: number) => {
    if (members.length > 1) {
      const updatedMembers = [...members];
      updatedMembers.splice(index, 1);
      setMembers(updatedMembers);
    }
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate household & password
      if (!householdName) {
        alert('Please enter a household name');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    } else if (currentStep === 2) {
      // Validate dog info
      if (!dog.name || !dog.breed) {
        alert('Please enter your dog\'s name and breed');
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!householdName || !password || !dog.name || members.some(m => !m.name)) {
      alert('Please fill in all required fields');
      return;
    }
    
    registerHousehold({
      householdName,
      password,
      dog,
      members,
    });
    
    navigate('/home');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <PawPrint size={28} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Create Your Family Account</h1>
            <p className="text-gray-500 mt-2">
              Set up your household for dog walking coordination
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div 
                  key={index}
                  className={`flex-1 h-1 rounded-full mx-1 ${
                    index + 1 <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4">Household Information</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Household Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Smith Family"
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4">Dog Information</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Buddy"
                        value={dog.name}
                        onChange={(e) => handleDogChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age (years)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="e.g., 3"
                        value={dog.age || ''}
                        onChange={(e) => handleDogChange('age', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Breed
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Golden Retriever"
                        value={dog.breed}
                        onChange={(e) => handleDogChange('breed', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 65"
                        value={dog.weight || ''}
                        onChange={(e) => handleDogChange('weight', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Needs (Optional)
                    </label>
                    <Textarea
                      placeholder="e.g., Allergic to chicken, needs medication twice daily"
                      value={dog.specialNeeds || ''}
                      onChange={(e) => handleDogChange('specialNeeds', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4">Family Members</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Add all family members who will be taking turns walking the dog
                  </p>
                  
                  {members.map((member, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{index === 0 ? 'Primary Member' : `Member ${index + 1}`}</h3>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g., John"
                            value={member.name}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email (Optional)
                          </label>
                          <Input
                            type="email"
                            placeholder="e.g., john@example.com"
                            value={member.email || ''}
                            onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3"
                          value={member.role}
                          onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                          required
                        >
                          {index === 0 ? (
                            <option value="Primary">Primary (Admin)</option>
                          ) : (
                            <>
                              <option value="Secondary">Secondary (Regular walker)</option>
                              <option value="Occasional">Occasional (Backup walker)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMember}
                    className="w-full py-2 flex items-center justify-center"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Add Another Member
                  </Button>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit">
                    Complete Setup
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
