
import { useState, useEffect, useCallback } from 'react';
import AppContext from './AppContext';
import { 
  AppState, 
  HouseholdMember, 
  Walk, 
  DogProfile, 
  WalkActivityData,
  WalkActivity,
  WalkStatus,
  Notification,
  NotificationType,
  DogMood
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';

// Type for registration data
type Registration = {
  householdName: string;
  password: string;
  dog: DogProfile;
  members: Omit<HouseholdMember, 'walkCount' | 'totalWalkDuration' | 'achievements'>[];
};

// Main app provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Initial state with mock data for development
  const initialState: AppState = {
    isRegistered: false,
    householdName: '',
    householdId: '',
    currentUser: '',
    dog: {
      name: '',
      breed: '',
      age: 0,
      weight: 0,
      energyLevel: undefined,
      specialNeeds: '',
    },
    members: [],
    walks: [],
    currentWalk: null,
    notifications: []
  };

  // State setup
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize state from localStorage if available
  useEffect(() => {
    const loadState = async () => {
      try {
        // Check localStorage for saved state
        const savedState = localStorage.getItem('dogWalkAppState');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        
        if (savedState && rememberMe) {
          const parsedState = JSON.parse(savedState);
          setState(parsedState);
        } else {
          // If not using remembered state, check sessionStorage for temp state
          const sessionState = sessionStorage.getItem('dogWalkAppState');
          if (sessionState) {
            const parsedState = JSON.parse(sessionState);
            setState(parsedState);
          } else {
            initializeWithMockDataIfNeeded();
          }
        }
      } catch (error) {
        console.error('Error loading state:', error);
        initializeWithMockDataIfNeeded();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadState();
  }, []);
  
  // Initialize with mock data if needed (dev only)
  const initializeWithMockDataIfNeeded = () => {
    if (process.env.NODE_ENV === 'development') {
      // Mock data can be imported or defined here
      const mockData: AppState = {
        isRegistered: false,
        householdName: "Sample Family",
        householdId: uuidv4(),
        currentUser: "",
        dog: {
          name: "Buddy",
          breed: "Golden Retriever",
          age: 3,
          weight: 65,
          energyLevel: "Medium",
          specialNeeds: ""
        },
        members: [],
        walks: [],
        currentWalk: null,
        notifications: []
      };
      setState(mockData);
    }
    setIsLoading(false);
  };
  
  // Persist state changes to storage
  useEffect(() => {
    if (!isLoading) {
      // Only save to localStorage if rememberMe is true
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      if (rememberMe) {
        localStorage.setItem('dogWalkAppState', JSON.stringify(state));
      }
      
      // Always save to sessionStorage for the current session
      sessionStorage.setItem('dogWalkAppState', JSON.stringify(state));
    }
  }, [state, isLoading]);
  
  // Update state with partial state changes
  const updateState = useCallback((partialState: Partial<AppState>) => {
    setState(prevState => ({
      ...prevState,
      ...partialState
    }));
  }, []);
  
  // Register a new household
  const registerHousehold = useCallback(async (
    registrationData: Registration
  ) => {
    try {
      const { householdName, password, dog, members } = registrationData;
      
      // Create a unique ID for the household
      const householdId = uuidv4();
      
      // Process member data to add IDs if needed
      const processedMembers: HouseholdMember[] = members.map(member => ({
        ...member,
        id: member.id || uuidv4(),
        walkCount: 0,
        totalWalkDuration: 0,
        achievements: []
      }));
      
      // Create initial walks for the next 14 days
      const initialWalks = generateInitialWalks(processedMembers);
      
      // Set initial notification
      const welcomeNotification: Notification = {
        id: uuidv4(),
        title: 'Welcome to the Dog Walking App!',
        message: 'Start by scheduling walks for your family members.',
        time: new Date(),
        read: false,
        type: 'system' as NotificationType
      };
      
      // Create the new state
      const newState: AppState = {
        isRegistered: true,
        householdName,
        householdId,
        currentUser: processedMembers[0].id, // Set first member as current user
        dog,
        members: processedMembers,
        walks: initialWalks,
        currentWalk: null,
        notifications: [welcomeNotification]
      };
      
      try {
        // Create household in Supabase
        const { error: householdError } = await supabase
          .from('households')
          .insert({
            id: householdId,
            name: householdName,
            password: password, // Note: In production, use proper auth with hashing
            created_at: new Date().toISOString()
          });
        
        if (householdError) throw householdError;
        
        // Add members to Supabase
        const { error: membersError } = await supabase
          .from('members')
          .insert(processedMembers.map(member => ({
            id: member.id,
            household_id: householdId,
            name: member.name,
            email: member.email || null,
            profile_picture: member.profilePicture || null,
            role: member.role,
            walk_count: 0,
            total_walk_duration: 0,
            achievements: member.achievements || []
          })));
        
        if (membersError) throw membersError;
        
        // Add dog to Supabase
        const { error: dogError } = await supabase
          .from('dogs')
          .insert({
            id: uuidv4(),
            household_id: householdId,
            name: dog.name,
            breed: dog.breed,
            age: dog.age,
            weight: dog.weight,
            special_needs: dog.specialNeeds || null,
            energy_level: dog.energyLevel || null
          });
        
        if (dogError) throw dogError;
        
        // Add walks to Supabase
        const { error: walksError } = await supabase
          .from('walks')
          .insert(initialWalks.map(walk => ({
            id: walk.id,
            household_id: householdId,
            date: walk.date.toISOString(),
            assigned_to: walk.assignedTo,
            status: walk.status,
            duration: null,
            notes: null,
            activity: null
          })));
        
        if (walksError) throw walksError;
        
        // Success - update local state
        setState(newState);
        
        toast.success('Household registration successful!');
        return true;
        
      } catch (error) {
        console.error('Error creating household in Supabase:', error);
        toast.error('Registration failed. Please try again.');
        
        // If in development or Supabase is not working, fallback to local storage
        console.log('Falling back to local storage only');
        setState(newState);
        return true;
      }
      
    } catch (error) {
      console.error('Error in household registration:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  }, []);
  
  // Generate initial walks for the household
  const generateInitialWalks = (members: HouseholdMember[]): Walk[] => {
    const walks: Walk[] = [];
    const today = new Date();
    const morningHour = 7;
    const eveningHour = 17;
    
    // Create morning and evening walks for the next 14 days
    for (let i = 0; i < 14; i++) {
      const walkDate = addDays(today, i);
      
      // Morning walk
      const morningWalkDate = new Date(walkDate);
      morningWalkDate.setHours(morningHour, 0, 0, 0);
      
      // Evening walk
      const eveningWalkDate = new Date(walkDate);
      eveningWalkDate.setHours(eveningHour, 0, 0, 0);
      
      // Assign members in round-robin fashion
      const morningMemberIndex = i % members.length;
      const eveningMemberIndex = (i + 1) % members.length;
      
      walks.push({
        id: uuidv4(),
        date: morningWalkDate,
        assignedTo: members[morningMemberIndex].id,
        status: 'Not Started' as WalkStatus
      });
      
      walks.push({
        id: uuidv4(),
        date: eveningWalkDate,
        assignedTo: members[eveningMemberIndex].id,
        status: 'Not Started' as WalkStatus
      });
    }
    
    return walks;
  };
  
  // Login a user to the household
  const loginUser = useCallback(async (
    householdName: string,
    password: string,
    memberId: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      // Check Supabase for the household
      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('name', householdName)
        .eq('password', password); // Note: In production, use proper auth with hashing
      
      if (householdError) throw householdError;
      
      if (!households || households.length === 0) {
        toast.error('Household not found or incorrect password');
        return false;
      }
      
      const householdId = households[0].id;
      
      // Get all household data
      try {
        // Get members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('household_id', householdId);
        
        if (membersError) throw membersError;
        
        // Get dog data
        const { data: dogsData, error: dogError } = await supabase
          .from('dogs')
          .select('*')
          .eq('household_id', householdId);
        
        if (dogError) throw dogError;
        
        // Get walks
        const { data: walksData, error: walksError } = await supabase
          .from('walks')
          .select('*')
          .eq('household_id', householdId);
        
        if (walksError) throw walksError;
        
        // Get notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('household_id', householdId);
        
        if (notificationsError) {
          console.log('Error fetching notifications:', notificationsError);
          // Continue with empty notifications array
        }
        
        // If the member ID is not found in the members list, return error
        const memberExists = membersData.some(member => member.id === memberId);
        if (!memberExists) {
          toast.error('Selected family member not found');
          return false;
        }
        
        // Transform data to match our app state structure
        const transformedMembers: HouseholdMember[] = membersData.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email || undefined,
          profilePicture: member.profile_picture || undefined,
          role: member.role,
          walkCount: member.walk_count || 0,
          totalWalkDuration: member.total_walk_duration || 0,
          achievements: member.achievements as string[] || []
        }));
        
        const dog = dogsData[0];
        const transformedDog: DogProfile = {
          name: dog.name,
          breed: dog.breed,
          age: dog.age,
          weight: dog.weight,
          energyLevel: dog.energy_level as "Low" | "Medium" | "High" | undefined,
          specialNeeds: dog.special_needs || undefined
        };
        
        const transformedWalks: Walk[] = walksData.map(walk => ({
          id: walk.id,
          date: new Date(walk.date),
          assignedTo: walk.assigned_to,
          duration: walk.duration || undefined,
          status: walk.status as WalkStatus,
          activity: walk.activity as WalkActivityData || undefined,
          notes: walk.notes || undefined,
          swapRequestedBy: undefined
        }));
        
        const transformedNotifications: Notification[] = notificationsData ? notificationsData.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          time: new Date(notif.time),
          read: notif.read,
          type: notif.type as NotificationType,
          relatedId: notif.related_id || undefined,
          acceptedBy: notif.accepted_by || undefined
        })) : [];
        
        // Create the new state
        const newState: AppState = {
          isRegistered: true,
          householdName,
          householdId,
          currentUser: memberId,
          dog: transformedDog,
          members: transformedMembers,
          walks: transformedWalks,
          notifications: transformedNotifications,
          currentWalk: null,
          rememberMe
        };
        
        // Update app state
        setState(newState);
        
        // Store if remember me is selected
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        
        toast.success(`Welcome back, ${transformedMembers.find(m => m.id === memberId)?.name}!`);
        return true;
        
      } catch (error) {
        console.error('Error fetching household data:', error);
        toast.error('Error loading household data');
        return false;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  }, []);
  
  // Switch to a different user in the household
  const switchUser = useCallback((memberId: string) => {
    setState(prevState => ({
      ...prevState,
      currentUser: memberId
    }));
    
    const member = state.members.find(m => m.id === memberId);
    if (member) {
      toast.success(`Switched to ${member.name}`);
    }
  }, [state.members]);
  
  // Add a new family member
  const addFamilyMember = useCallback(async (newMember: Omit<HouseholdMember, 'id' | 'walkCount' | 'totalWalkDuration' | 'achievements'>) => {
    const memberId = uuidv4();
    const completeMember: HouseholdMember = {
      ...newMember,
      id: memberId,
      walkCount: 0,
      totalWalkDuration: 0,
      achievements: []
    };
    
    setState(prevState => ({
      ...prevState,
      members: [...prevState.members, completeMember]
    }));
    
    // Update in Supabase if connected
    if (state.householdId) {
      supabase
        .from('members')
        .insert({
          id: memberId,
          household_id: state.householdId,
          name: newMember.name,
          email: newMember.email || null,
          profile_picture: newMember.profilePicture || null,
          role: newMember.role,
          walk_count: 0,
          total_walk_duration: 0,
          achievements: []
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error adding member to Supabase:', error);
          }
        });
    }
    
    toast.success(`Added new family member: ${newMember.name}`);
    return Promise.resolve(completeMember);
  }, [state.householdId]);
  
  // Remove a family member
  const removeFamilyMember = useCallback(async (memberId: string) => {
    // Get the member name before removal for the toast message
    const memberName = state.members.find(m => m.id === memberId)?.name;
    
    // Don't allow removing the current user
    if (memberId === state.currentUser) {
      toast.error("You can't remove yourself");
      return Promise.resolve(false);
    }
    
    // Update walks assigned to this member
    const updatedWalks = state.walks.map(walk => {
      if (walk.assignedTo === memberId) {
        // Find another member to assign walks to
        const otherMemberId = state.members.find(m => m.id !== memberId)?.id || state.currentUser;
        return {
          ...walk,
          assignedTo: otherMemberId
        };
      }
      return walk;
    });
    
    setState(prevState => ({
      ...prevState,
      members: prevState.members.filter(m => m.id !== memberId),
      walks: updatedWalks
    }));
    
    // Update in Supabase if connected
    if (state.householdId) {
      supabase
        .from('members')
        .delete()
        .eq('id', memberId)
        .eq('household_id', state.householdId)
        .then(({ error }) => {
          if (error) {
            console.error('Error removing member from Supabase:', error);
          }
        });
      
      // Update walks in Supabase
      updatedWalks.forEach(walk => {
        if (walk.assignedTo !== memberId) {
          supabase
            .from('walks')
            .update({ assigned_to: walk.assignedTo })
            .eq('id', walk.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating walk in Supabase:', error);
              }
            });
        }
      });
    }
    
    toast.success(`Removed family member: ${memberName}`);
    return Promise.resolve(true);
  }, [state.members, state.walks, state.currentUser, state.householdId]);
  
  // Get walker name by ID
  const getWalkerName = useCallback((walkerId: string): string => {
    const walker = state.members.find(member => member.id === walkerId);
    return walker ? walker.name : 'Unknown';
  }, [state.members]);
  
  // Get member by ID
  const getMemberById = useCallback((id: string): HouseholdMember | undefined => {
    return state.members.find(member => member.id === id);
  }, [state.members]);
  
  // Start a dog walk
  const startWalk = useCallback((walkId: string): boolean => {
    try {
      const walkToUpdate = state.walks.find(w => w.id === walkId);
      
      if (!walkToUpdate) {
        toast.error('Walk not found');
        return false;
      }
      
      if (walkToUpdate.assignedTo !== state.currentUser) {
        toast.error('This walk is assigned to someone else');
        return false;
      }
      
      if (walkToUpdate.status !== 'Not Started' && walkToUpdate.status !== 'Confirmed') {
        toast.error(`Cannot start walk in ${walkToUpdate.status} status`);
        return false;
      }
      
      // Update walk status
      const updatedWalks = state.walks.map(walk => {
        if (walk.id === walkId) {
          return {
            ...walk,
            status: 'In Progress' as WalkStatus,
            startTime: new Date()
          };
        }
        return walk;
      });
      
      updateState({ 
        walks: updatedWalks,
        currentWalk: updatedWalks.find(w => w.id === walkId) || null
      });
      
      // Update in Supabase if connected
      if (state.householdId) {
        supabase
          .from('walks')
          .update({
            status: 'In Progress',
            start_time: new Date().toISOString()
          })
          .eq('id', walkId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating walk in Supabase:', error);
            }
          });
      }
      
      toast.success('Walk started');
      return true;
    } catch (error) {
      console.error('Error starting walk:', error);
      toast.error('Failed to start walk');
      return false;
    }
  }, [state.walks, state.currentUser, state.householdId, updateState]);
  
  // End a walk
  const endWalk = useCallback((walkData: { activity: WalkActivityData; dogMood: DogMood }): boolean => {
    try {
      if (!state.currentWalk) {
        toast.error('No walk in progress');
        return false;
      }
      
      const walkId = state.currentWalk.id;
      const startTime = state.currentWalk.startTime;
      
      if (!startTime) {
        toast.error('Walk start time not recorded');
        return false;
      }
      
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Duration in minutes
      
      // Update walk with completion info
      const updatedWalks = state.walks.map(walk => {
        if (walk.id === walkId) {
          return {
            ...walk,
            status: 'Completed' as WalkStatus,
            endTime,
            duration,
            activity: walkData.activity,
            dogMood: walkData.dogMood
          };
        }
        return walk;
      });
      
      // Update dog info and member stats
      const updatedMembers = state.members.map(member => {
        if (member.id === state.currentUser) {
          return {
            ...member,
            walkCount: member.walkCount + 1,
            totalWalkDuration: member.totalWalkDuration + duration
          };
        }
        return member;
      });
      
      // Create notification
      const newNotification: Notification = {
        id: uuidv4(),
        title: 'Walk Completed',
        message: `${getWalkerName(state.currentUser)} completed a ${duration} minute walk with ${state.dog.name}`,
        time: new Date(),
        read: false,
        type: 'walk_completed',
        relatedId: walkId
      };
      
      updateState({
        walks: updatedWalks,
        members: updatedMembers,
        notifications: [...state.notifications, newNotification],
        currentWalk: null
      });
      
      // Update in Supabase if connected
      if (state.householdId) {
        // Update walk
        supabase
          .from('walks')
          .update({
            status: 'Completed',
            end_time: endTime.toISOString(),
            duration,
            activity: walkData.activity,
            dog_mood: walkData.dogMood
          })
          .eq('id', walkId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating walk in Supabase:', error);
            }
          });
        
        // Update member stats
        const currentMember = updatedMembers.find(m => m.id === state.currentUser);
        if (currentMember) {
          supabase
            .from('members')
            .update({
              walk_count: currentMember.walkCount,
              total_walk_duration: currentMember.totalWalkDuration
            })
            .eq('id', currentMember.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating member in Supabase:', error);
              }
            });
        }
        
        // Add notification
        supabase
          .from('notifications')
          .insert({
            id: newNotification.id,
            household_id: state.householdId,
            title: newNotification.title,
            message: newNotification.message,
            time: newNotification.time.toISOString(),
            read: false,
            type: newNotification.type,
            related_id: walkId
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error adding notification to Supabase:', error);
            }
          });
      }
      
      toast.success('Walk completed!');
      return true;
    } catch (error) {
      console.error('Error completing walk:', error);
      toast.error('Failed to complete walk');
      return false;
    }
  }, [state.currentWalk, state.currentUser, state.dog.name, state.householdId, state.members, state.notifications, state.walks, getWalkerName, updateState]);
  
  // Request someone to cover a walk
  const requestWalkCover = useCallback((walkId: string): boolean => {
    try {
      const walkToUpdate = state.walks.find(w => w.id === walkId);
      
      if (!walkToUpdate) {
        toast.error('Walk not found');
        return false;
      }
      
      if (walkToUpdate.assignedTo !== state.currentUser) {
        toast.error('This walk is assigned to someone else');
        return false;
      }
      
      if (walkToUpdate.status !== 'Not Started' && walkToUpdate.status !== 'Confirmed') {
        toast.error(`Cannot request cover for a walk in ${walkToUpdate.status} status`);
        return false;
      }
      
      // Create notification for other family members
      const newNotification: Notification = {
        id: uuidv4(),
        title: 'Walk Cover Needed',
        message: `${getWalkerName(state.currentUser)} needs someone to cover a walk on ${format(walkToUpdate.date, 'MMM d')} at ${format(walkToUpdate.date, 'h:mm a')}`,
        time: new Date(),
        read: false,
        type: 'cover_request',
        relatedId: walkId
      };
      
      updateState({
        notifications: [...state.notifications, newNotification]
      });
      
      // Update in Supabase if connected
      if (state.householdId) {
        supabase
          .from('notifications')
          .insert({
            id: newNotification.id,
            household_id: state.householdId,
            title: newNotification.title,
            message: newNotification.message,
            time: newNotification.time.toISOString(),
            read: false,
            type: newNotification.type,
            related_id: walkId
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error adding notification to Supabase:', error);
            }
          });
      }
      
      toast.success('Cover request sent to family members');
      return true;
      
    } catch (error) {
      console.error('Error requesting walk cover:', error);
      toast.error('Failed to request walk cover');
      return false;
    }
  }, [state.walks, state.currentUser, state.notifications, state.householdId, getWalkerName, updateState]);
  
  // Request to swap a walk with another family member
  const requestWalkSwap = useCallback((walkId: string): boolean => {
    try {
      const walkToSwap = state.walks.find(w => w.id === walkId);
      
      if (!walkToSwap) {
        toast.error('Walk not found');
        return false;
      }
      
      if (walkToSwap.assignedTo !== state.currentUser) {
        toast.error('You can only request swaps for walks assigned to you');
        return false;
      }
      
      if (walkToSwap.status !== 'Not Started') {
        toast.error(`Cannot request swap for a walk in ${walkToSwap.status} status`);
        return false;
      }
      
      // Mark the walk as having a swap requested
      const updatedWalks = state.walks.map(walk => {
        if (walk.id === walkId) {
          return {
            ...walk,
            status: 'Swap Requested' as WalkStatus,
            swapRequestedBy: state.currentUser
          };
        }
        return walk;
      });
      
      // Create notification for other family members
      const newNotification: Notification = {
        id: uuidv4(),
        title: 'Walk Swap Request',
        message: `${getWalkerName(state.currentUser)} is looking for someone to take over a walk on ${format(walkToSwap.date, 'MMM d')} at ${format(walkToSwap.date, 'h:mm a')}`,
        time: new Date(),
        read: false,
        type: 'walk_swap_request',
        relatedId: walkId
      };
      
      updateState({
        walks: updatedWalks,
        notifications: [...state.notifications, newNotification]
      });
      
      // Update in Supabase if connected
      if (state.householdId) {
        // Update walk status
        supabase
          .from('walks')
          .update({
            status: 'Swap Requested'
          })
          .eq('id', walkId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating walk in Supabase:', error);
            }
          });
        
        // Add notification
        supabase
          .from('notifications')
          .insert({
            id: newNotification.id,
            household_id: state.householdId,
            title: newNotification.title,
            message: newNotification.message,
            time: newNotification.time.toISOString(),
            read: false,
            type: newNotification.type,
            related_id: walkId
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error adding notification to Supabase:', error);
            }
          });
      }
      
      toast.success('Walk swap requested');
      return true;
    } catch (error) {
      console.error('Error requesting walk swap:', error);
      toast.error('Failed to request walk swap');
      return false;
    }
  }, [state.walks, state.currentUser, state.notifications, state.householdId, getWalkerName, updateState]);
  
  // Accept a walk swap request
  const acceptWalkSwap = useCallback((notificationId: string, walkId: string): boolean => {
    try {
      const walkToSwap = state.walks.find(w => w.id === walkId);
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (!walkToSwap || !notification) {
        toast.error('Walk or notification not found');
        return false;
      }
      
      if (walkToSwap.status !== 'Swap Requested') {
        toast.error('This walk is no longer available for swap');
        return false;
      }
      
      if (walkToSwap.swapRequestedBy === state.currentUser) {
        toast.error('You cannot accept your own swap request');
        return false;
      }
      
      // Accept the swap
      const originalWalker = walkToSwap.swapRequestedBy || walkToSwap.assignedTo;
      
      // Update the walk
      const updatedWalks = state.walks.map(walk => {
        if (walk.id === walkId) {
          return {
            ...walk,
            assignedTo: state.currentUser,
            status: 'Not Started' as WalkStatus,
            swapRequestedBy: undefined
          };
        }
        return walk;
      });
      
      // Mark the notification as read and accepted
      const updatedNotifications = state.notifications.map(n => {
        if (n.id === notificationId) {
          return {
            ...n,
            read: true,
            acceptedBy: state.currentUser
          };
        }
        return n;
      });
      
      // Create notification for the original walker
      const swapAcceptedNotification: Notification = {
        id: uuidv4(),
        title: 'Walk Swap Accepted',
        message: `${getWalkerName(state.currentUser)} has agreed to take your walk on ${format(walkToSwap.date, 'MMM d')} at ${format(walkToSwap.date, 'h:mm a')}`,
        time: new Date(),
        read: false,
        type: 'walk_swap_accepted',
        relatedId: walkId
      };
      
      updateState({
        walks: updatedWalks,
        notifications: [...updatedNotifications, swapAcceptedNotification]
      });
      
      // Update in Supabase if connected
      if (state.householdId) {
        // Update walk
        supabase
          .from('walks')
          .update({
            assigned_to: state.currentUser,
            status: 'Not Started'
          })
          .eq('id', walkId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating walk in Supabase:', error);
            }
          });
        
        // Update original notification
        supabase
          .from('notifications')
          .update({
            read: true,
            accepted_by: state.currentUser
          })
          .eq('id', notificationId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating notification in Supabase:', error);
            }
          });
        
        // Add new notification
        supabase
          .from('notifications')
          .insert({
            id: swapAcceptedNotification.id,
            household_id: state.householdId,
            title: swapAcceptedNotification.title,
            message: swapAcceptedNotification.message,
            time: swapAcceptedNotification.time.toISOString(),
            read: false,
            type: swapAcceptedNotification.type,
            related_id: walkId
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error adding notification to Supabase:', error);
            }
          });
      }
      
      toast.success(`You've taken over a walk from ${getWalkerName(originalWalker)}`);
      return true;
    } catch (error) {
      console.error('Error accepting walk swap:', error);
      toast.error('Failed to accept walk swap');
      return false;
    }
  }, [state.walks, state.currentUser, state.notifications, state.householdId, getWalkerName, updateState]);
  
  // Confirm a walk
  const confirmWalk = useCallback((walkId: string): boolean => {
    try {
      const walkToConfirm = state.walks.find(w => w.id === walkId);
      
      if (!walkToConfirm) {
        toast.error('Walk not found');
        return false;
      }
      
      if (walkToConfirm.assignedTo !== state.currentUser) {
        toast.error('You can only confirm walks assigned to you');
        return false;
      }
      
      if (walkToConfirm.status !== 'Not Started') {
        toast.error(`Cannot confirm a walk in ${walkToConfirm.status} status`);
        return false;
      }
      
      // Confirm the walk
      const updatedWalks = state.walks.map(walk => {
        if (walk.id === walkId) {
          return {
            ...walk,
            status: 'Confirmed' as WalkStatus
          };
        }
        return walk;
      });
      
      updateState({ walks: updatedWalks });
      
      // Update in Supabase if connected
      if (state.householdId) {
        supabase
          .from('walks')
          .update({
            status: 'Confirmed'
          })
          .eq('id', walkId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating walk in Supabase:', error);
            }
          });
      }
      
      toast.success('Walk confirmed and locked in');
      return true;
    } catch (error) {
      console.error('Error confirming walk:', error);
      toast.error('Failed to confirm walk');
      return false;
    }
  }, [state.walks, state.currentUser, state.householdId, updateState]);
  
  // Get today's walk for the current user
  const getTodaysWalk = useCallback((): Walk | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysWalk = state.walks.find(walk => {
      const walkDate = new Date(walk.date);
      return (
        walkDate >= today && 
        walkDate < tomorrow && 
        walk.assignedTo === state.currentUser &&
        (walk.status === 'Not Started' || walk.status === 'Confirmed' || walk.status === 'In Progress')
      );
    });
    
    return todaysWalk || null;
  }, [state.walks, state.currentUser]);

  // Mark a notification as read
  const markNotificationAsRead = useCallback((notificationId: string): void => {
    try {
      // Update the notification
      const updatedNotifications = state.notifications.map(n => {
        if (n.id === notificationId) {
          return {
            ...n,
            read: true
          };
        }
        return n;
      });
      
      updateState({ notifications: updatedNotifications });
      
      // Update in Supabase if connected
      if (state.householdId) {
        supabase
          .from('notifications')
          .update({
            read: true
          })
          .eq('id', notificationId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating notification in Supabase:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [state.notifications, state.householdId, updateState]);
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback((): void => {
    try {
      // Update all unread notifications
      const updatedNotifications = state.notifications.map(n => ({
        ...n,
        read: true
      }));
      
      updateState({ notifications: updatedNotifications });
      
      // Update in Supabase if connected
      if (state.householdId) {
        const unreadIds = state.notifications
          .filter(n => !n.read)
          .map(n => n.id);
        
        if (unreadIds.length > 0) {
          supabase
            .from('notifications')
            .update({
              read: true
            })
            .in('id', unreadIds)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating notifications in Supabase:', error);
              }
            });
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [state.notifications, state.householdId, updateState]);
  
  // Get count of unread notifications
  const getUnreadNotificationsCount = useCallback((): number => {
    return state.notifications.filter(n => !n.read).length;
  }, [state.notifications]);
  
  // Logout from the current household
  const logoutUser = useCallback(() => {
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('dogWalkAppState');
    localStorage.removeItem('dogWalkAppState');
    setState(initialState);
    toast.info('You have been logged out');
  }, []);
  
  // Context value to provide
  const contextValue = {
    state,
    isLoading,
    updateState,
    registerHousehold,
    loginUser,
    switchUser,
    addFamilyMember,
    removeFamilyMember,
    getWalkerName,
    getMemberById,
    startWalk,
    endWalk,
    requestWalkCover,
    requestWalkSwap,
    acceptWalkSwap,
    confirmWalk,
    getTodaysWalk,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationsCount,
    logoutUser
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
