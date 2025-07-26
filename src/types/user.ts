import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    bio?: string;
    social?: {
        github?: string;
        twitter?: string;
        linkedin?: string;
    };
    createdAt: Timestamp;
    stats?: {
        created: number;
        saved: number;
        starred: number;
    }
}
