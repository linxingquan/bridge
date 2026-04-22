import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    profile: {
        name: string;
        dob: Date;
        gender: 'man' | 'woman' | 'other';
        preferredGender: 'man' | 'woman' | 'everyone';
        location: {
            city: string;
            coordinates: [number, number];
        };
        photos: string[];
        bio: string;
        interests: string[];
        prompts: {
            question: string;
            answer: string;
        }[];
        height: string;
        education: string;
        relationshipGoal: 'casual' | 'serious' | 'dont_know';
    };
    preferences: {
        ageMin: number;
        ageMax: number;
        maxDistance: number;
        distanceUnit: 'km' | 'miles';
    };
    dailyLikes: {
        count: number;
        resetDate: Date;
    };
    isActive: boolean;
    resetToken?: string;
    resetTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: Model<IUser>;
//# sourceMappingURL=User.d.ts.map