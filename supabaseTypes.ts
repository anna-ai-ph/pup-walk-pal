
import { Database } from '@/integrations/supabase/types';

// Define types for our Supabase tables
export type HouseholdTable = Database['public']['Tables']['households']['Row'];
export type DogTable = Database['public']['Tables']['dogs']['Row'];
export type MemberTable = Database['public']['Tables']['members']['Row'];
export type WalkTable = Database['public']['Tables']['walks']['Row'];

// Helper types for Supabase operations
export type HouseholdInsert = Database['public']['Tables']['households']['Insert'];
export type DogInsert = Database['public']['Tables']['dogs']['Insert'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type WalkInsert = Database['public']['Tables']['walks']['Insert'];
