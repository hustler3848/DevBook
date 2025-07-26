
import { Timestamp } from 'firebase/firestore';

export interface Folder {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  snippetIds: string[];
  createdAt: Timestamp;
}
