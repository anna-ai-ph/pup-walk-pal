
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { DogProfile as DogProfileType } from '@/context/types';
import { toast } from 'sonner';

const DogProfile = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  
  const [dogProfile, setDogProfile] = useState<DogProfileType>({ ...state.dog });
  
  const handleChange = (field: keyof DogProfileType, value: string | number) => {
    setDogProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateState({ dog: dogProfile });
    toast.success("Dog profile updated successfully!");
    navigate('/settings');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 mt-16 mb-20">
        <h1 className="text-2xl font-bold mb-1">
          Edit Dog Profile
        </h1>
        <p className="text-gray-500 mb-6">
          Update your dog's information
        </p>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 text-2xl">
                  🐾
                </div>
                <h2 className="text-xl font-medium">{state.dog.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={dogProfile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
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
                    value={dogProfile.age}
                    onChange={(e) => handleChange('age', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <Input
                    type="text"
                    value={dogProfile.breed}
                    onChange={(e) => handleChange('breed', e.target.value)}
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
                    value={dogProfile.weight}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Needs (Optional)
                </label>
                <Textarea
                  value={dogProfile.specialNeeds || ''}
                  onChange={(e) => handleChange('specialNeeds', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default DogProfile;
