
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { User, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HouseholdMember } from '@/context/types';
import { toast } from 'sonner';

export function UserSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, switchUser, addFamilyMember, removeFamilyMember } = useApp();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Omit<HouseholdMember, 'walkCount' | 'totalWalkDuration' | 'achievements'>>({
    id: '',
    name: '',
    email: '',
    profilePicture: '',
    role: 'Secondary',
  });
  
  // Set current user as initially selected
  useEffect(() => {
    if (open && state.currentUser) {
      setSelectedUser(state.currentUser);
    }
  }, [open, state.currentUser]);

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    switchUser(userId);
    onClose();
  };

  const handleAddUserClick = () => {
    setShowAddUser(true);
  };

  const handleAddUserSubmit = () => {
    if (!newUser.name) {
      toast.error("Please enter a name");
      return;
    }
    
    // Generate a new unique ID
    const newId = `${Date.now()}`;
    
    // Add the new user
    const addedMember = addFamilyMember({
      ...newUser,
      id: newId
    });
    
    // Reset form and close dialog
    setNewUser({ id: '', name: '', email: '', role: 'Secondary', profilePicture: '' });
    setShowAddUser(false);
  };
  
  const handleRemoveUser = (userId: string) => {
    // Only allow primary users to remove others
    const currentMember = state.members.find(m => m.id === state.currentUser);
    if (currentMember?.role !== 'Primary') {
      toast.error("Only the primary user can remove family members");
      return;
    }
    
    // Don't allow removing the current user
    if (userId === state.currentUser) {
      toast.error("You cannot remove yourself");
      return;
    }
    
    // Confirm before removing
    if (window.confirm(`Are you sure you want to remove this family member?`)) {
      removeFamilyMember(userId);
    }
  };

  const handleInputChange = (field: keyof typeof newUser, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };
  
  // Determine if current user is primary
  const isPrimary = state.members.find(m => m.id === state.currentUser)?.role === 'Primary';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Family Member</DialogTitle>
        </DialogHeader>
        
        {showAddUser ? (
          <div className="py-4">
            <h3 className="font-medium mb-4">Add New Family Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <Input
                  type="email"
                  value={newUser.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={newUser.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                >
                  <option value="Secondary">Secondary (Regular walker)</option>
                  <option value="Occasional">Occasional (Backup walker)</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUserSubmit}
                  disabled={!newUser.name}
                  className="flex-1"
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {state.members.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {state.members.map((member) => (
                    <div key={member.id} className="relative">
                      <Button
                        variant="outline"
                        className={`h-auto w-full flex flex-col items-center justify-center p-4 ${
                          selectedUser === member.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleUserSelect(member.id)}
                      >
                        <Avatar className="h-16 w-16 mb-3">
                          {member.profilePicture ? (
                            <img src={member.profilePicture} alt={member.name} />
                          ) : (
                            <User className="h-10 w-10" />
                          )}
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-xs text-gray-500">{member.role}</span>
                      </Button>
                      
                      {isPrimary && member.id !== state.currentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500"
                          onClick={() => handleRemoveUser(member.id)}
                        >
                          <span className="sr-only">Remove</span>
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No family members found
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAddUserClick}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Family Member
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
