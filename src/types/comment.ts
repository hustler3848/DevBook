import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  createdAt: Timestamp;
}
