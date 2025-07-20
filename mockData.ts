
import { DogProfile, HouseholdMember } from './types';

// Initial dog profile with empty values
export const initialDog: DogProfile = {
  name: '',
  age: 0,
  breed: '',
  weight: 0,
};

// Initial member profile
export const initialMember: HouseholdMember = {
  id: '1',
  name: '',
  role: 'Primary',
  walkCount: 0,
  totalWalkDuration: 0,
  achievements: [],
};
