import { Timestamp } from 'firebase/firestore';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  tags: string[];
  language: string;
  creatorId: string;
  author: string;
  authorUsername: string;
  avatar: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  starCount: number;
  saveCount: number;
  // Client-side only fields for user interactions
  isStarred?: boolean;
  isSaved?: boolean;
  // Timestamps for user-specific collections
  starredAt?: Timestamp;
  savedAt?: Timestamp;
}
