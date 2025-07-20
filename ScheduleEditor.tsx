import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Lock, Info } from 'lucide-react';
import { Walk, HouseholdMember, WalkActivityData } from '@/context/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

type ScheduleEditorProps = {
  walks: Walk[];
  members: HouseholdMember[];
  onSave: (updatedWalks: Walk[]) => void;
};

type WeekDay = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

const ScheduleEditor = ({ walks, members, onSave }: ScheduleEditorProps) => {
  const [localWalks, setLocalWalks] = useState<Walk[]>(walks);
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Sunday');
  const [isSaving, setIsSaving] = useState(false);
  const [walkIdsToDelete, setWalkIdsToDelete] = useState<string[]>([]);
  
  // Sync with props when walks change
  useEffect(() => {
    setLocalWalks(walks);
    setWalkIdsToDelete([]);
  }, [walks]);
  
  // Generate an array of weekdays
  const weekDays: WeekDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Filter walks for the selected day of week
  const dayWalks = localWalks.filter(walk => {
    const walkDate = new Date(walk.date);
    const dayOfWeek = weekDays[walkDate.getDay()];
    return dayOfWeek === selectedDay;
  });
  
  // Check if a walk is confirmed (specific date walk that can't be changed)
  const isWalkConfirmed = (walk: Walk): boolean => {
    return walk.status === 'Confirmed';
  };
  
  const addWalk = () => {
    // Create a new walk for the selected day of week
    // We'll use the current date but adjust it to the selected day of week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const dayIndex = weekDays.indexOf(selectedDay);
    const newWalkDay = addDays(weekStart, dayIndex);
    newWalkDay.setHours(12, 0, 0, 0); // Default to noon
    
    // Generate a proper UUID for new walks
    const newWalk: Walk = {
      id: uuidv4(),
      date: newWalkDay,
      assignedTo: members.length > 0 ? members[0].id : '',
      status: 'Not Started',
    };
    
    setLocalWalks([...localWalks, newWalk]);
    toast.info("Remember that each walk is scheduled individually and not recurring");
  };
  
  const removeWalk = (walkId: string) => {
    const walkToRemove = localWalks.find(walk => walk.id === walkId);
    
    if (walkToRemove && isWalkConfirmed(walkToRemove)) {
      toast.error("Cannot remove a confirmed walk");
      return;
    }
    
    // Add the removed walk's ID to the list of IDs to delete from the database
    setWalkIdsToDelete(prev => [...prev, walkId]);
    setLocalWalks(localWalks.filter(walk => walk.id !== walkId));
  };
  
  const updateWalkTime = (walkId: string, timeString: string) => {
    setLocalWalks(localWalks.map(walk => {
      if (walk.id === walkId) {
        if (isWalkConfirmed(walk)) {
          toast.error("Cannot modify a confirmed walk");
          return walk;
        }
        
        const [hours, minutes] = timeString.split(':').map(Number);
        const newDate = new Date(walk.date);
        newDate.setHours(hours, minutes, 0, 0);
        return { ...walk, date: newDate };
      }
      return walk;
    }));
  };
  
  const updateWalkAssignee = (walkId: string, memberId: string) => {
    setLocalWalks(localWalks.map(walk => {
      if (walk.id === walkId) {
        if (isWalkConfirmed(walk)) {
          toast.error("Cannot modify a confirmed walk");
          return walk;
        }
        
        return { ...walk, assignedTo: memberId };
      }
      return walk;
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call parent component callback to update state
      onSave(localWalks);
      
      // Save to Supabase
      const householdId = localStorage.getItem('householdId');
      if (!householdId) {
        toast.error("Household ID not found");
        return;
      }
      
      // Delete walks that have been removed locally
      if (walkIdsToDelete.length > 0) {
        console.log('Deleting walks:', walkIdsToDelete);
        const { error: deleteError } = await supabase
          .from('walks')
          .delete()
          .in('id', walkIdsToDelete);
          
        if (deleteError) {
          console.error('Error deleting walks:', deleteError);
          toast.error('Failed to delete removed walks');
        }
      }
      
      // Process each walk separately for reliability
      for (const walk of localWalks) {
        console.log('Processing walk:', walk.id);
        
        // Prepare walk data for Supabase
        const walkToSave = {
          id: walk.id,
          household_id: householdId,
          date: walk.date instanceof Date ? walk.date.toISOString() : walk.date,
          assigned_to: walk.assignedTo || null,
          status: walk.status,
          start_time: walk.startTime ? new Date(walk.startTime).toISOString() : null,
          end_time: walk.endTime ? new Date(walk.endTime).toISOString() : null,
          duration: walk.duration,
          activity: walk.activity as unknown as Json,
          dog_mood: walk.dogMood,
          notes: walk.notes
        };
        
        // Check if walk exists in Supabase
        const { data: existingWalk, error: checkError } = await supabase
          .from('walks')
          .select('id')
          .eq('id', walk.id)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking for existing walk:', checkError);
          continue;
        }
        
        if (existingWalk) {
          // Update existing walk
          console.log('Updating existing walk:', walk.id);
          const { error: updateError } = await supabase
            .from('walks')
            .update(walkToSave)
            .eq('id', walk.id);
            
          if (updateError) {
            console.error('Error updating walk:', updateError);
            toast.error(`Failed to update walk: ${updateError.message}`);
          }
        } else {
          // Insert new walk
          console.log('Inserting new walk:', walk.id);
          const { error: insertError } = await supabase
            .from('walks')
            .insert(walkToSave);
            
          if (insertError) {
            console.error('Error inserting walk:', insertError);
            toast.error(`Failed to create walk: ${insertError.message}`);
          }
        }
      }
      
      // Reset the list of walk IDs to delete
      setWalkIdsToDelete([]);
      
      toast.success("Walk schedule saved successfully");
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error("Failed to save walk schedule");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-medium mb-3">Select Day of Week</h3>
        <div className="flex overflow-x-auto pb-2 -mx-1 scrollbar-none">
          {weekDays.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-full mx-1 transition-colors ${
                selectedDay === day
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs font-medium">{day.slice(0, 3)}</span>
              <span className="text-lg font-bold">{day.charAt(0)}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4 flex items-start">
        <Info size={18} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-yellow-700">
          Changes made to walks are specific to individual dates and won't affect future occurrences. 
          Each walk is scheduled independently.
        </p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Walks for {selectedDay}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addWalk}
            className="flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" />
            Add Walk
          </Button>
        </div>
        
        {dayWalks.length > 0 ? (
          <div className="space-y-3">
            {dayWalks.map((walk) => {
              const confirmed = isWalkConfirmed(walk);
              const date = walk.date instanceof Date ? walk.date : new Date(walk.date);
              const formattedDate = format(date, 'MMM d, yyyy');
              
              return (
                <div 
                  key={walk.id} 
                  className={`p-3 border rounded-md ${
                    confirmed 
                      ? 'bg-gray-100 border-gray-300' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {confirmed && (
                      <div className="absolute top-2 right-2 text-gray-500 flex items-center">
                        <Lock size={14} className="mr-1" />
                        <span className="text-xs">Confirmed</span>
                      </div>
                    )}
                    
                    <div className="w-full mb-2 text-xs text-gray-500">
                      Specific Date: {formattedDate}
                    </div>
                    
                    <div className="flex-1 mr-2">
                      <label className="block text-xs text-gray-500 mb-1">Time</label>
                      <Input 
                        type="time" 
                        value={format(date, 'HH:mm')}
                        onChange={(e) => updateWalkTime(walk.id, e.target.value)}
                        disabled={confirmed}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="flex-1 mr-2">
                      <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
                      <select
                        value={walk.assignedTo}
                        onChange={(e) => updateWalkAssignee(walk.id, e.target.value)}
                        disabled={confirmed}
                        className={`w-full border rounded-md py-1.5 px-3 text-sm ${
                          confirmed ? 'bg-gray-100 border-gray-300' : 'border-gray-300'
                        }`}
                      >
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWalk(walk.id)}
                      disabled={confirmed}
                      className={`mt-4 p-1 h-auto ${
                        confirmed ? 'text-gray-400' : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">No walks scheduled for {selectedDay}</p>
            <p className="text-sm text-gray-400 mt-1">Click 'Add Walk' to schedule one</p>
          </div>
        )}
      </div>
      
      <div className="pt-4">
        <Button
          onClick={handleSave}
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="flex items-center">
              <span className="mr-2">Saving</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleEditor;
