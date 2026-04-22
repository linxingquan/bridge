export interface User {
  _id: string;
  email: string;
  profile: Profile;
  preferences: Preferences;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  name: string;
  dob: string;
  gender: 'man' | 'woman' | 'other';
  preferredGender: 'man' | 'woman' | 'everyone';
  location: {
    city: string;
    coordinates: [number, number];
  };
  photos: string[];
  profilePhoto: string;
  bio: string;
  interests: string[];
  prompts: { question: string; answer: string }[];
  height: string;
  education: string;
  relationshipGoal: 'casual' | 'serious' | 'dont_know';
}

export interface Preferences {
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  distanceUnit: 'km' | 'miles';
}

export interface Match {
  matchId: string;
  user: {
    id: string;
    name: string;
    photo: string;
    city: string;
  };
  matchedAt: string;
}

export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  text: string;
  photo?: string;
  isRead: boolean;
  reactions: { userId: string; emoji: string }[];
  createdAt: string;
}

export interface ProfileCard {
  id: string;
  name: string;
  age: number;
  distance: number;
  photo?: string;
  bio: string;
  interests: string[];
}

export interface SingleUser {
  id: string;
  name: string;
  age: number;
  gender: 'man' | 'woman' | 'other';
  profilePhoto: string;
  photos: string[];
  bio: string;
  interests: string[];
  location: string;
  height: string;
  education: string;
}

export interface OnboardingData {
  name: string;
  dob: string;
  gender: 'man' | 'woman' | 'other';
  preferredGender: 'man' | 'woman' | 'everyone';
  city: string;
  photos: string[];
  interests: string[];
  bio: string;
  prompts: { question: string; answer: string }[];
  relationshipGoal: 'casual' | 'serious' | 'dont_know';
}