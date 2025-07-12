
import { Timestamp } from 'firebase/firestore';

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  codeSnippet?: string; // On summary cards this may be omitted
  tags: string[];
  language: string;
  creatorId?: string;
  createdAt?: Timestamp;
  isPublic?: boolean;
  starCount?: number;
  // Fields for community snippets
  author?: string;
  avatar?: string;
  // Fields for user interactions
  isStarred?: boolean;
  isSaved?: boolean;
  starredAt?: Timestamp;
  savedAt?: Timestamp;
}
