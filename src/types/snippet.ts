
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
}
