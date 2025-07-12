
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Snippet } from '@/types/snippet';

// Type for the data being sent to Firestore, omitting the `id` which is auto-generated
type SnippetData = Omit<Snippet, 'id' | 'createdAt'>;

/**
 * Adds a new snippet to the user's collection in Firestore.
 * @param userId - The ID of the user creating the snippet.
 * @param data - The snippet data to be saved.
 */
export const addSnippet = async (userId: string, data: SnippetData) => {
  if (!userId) {
    throw new Error('User ID is required to add a snippet.');
  }
  
  await addDoc(collection(db, 'snippets'), {
    ...data,
    creatorId: userId,
    createdAt: serverTimestamp(),
    isPublic: false, // Default to private
    starCount: 0,
  });
};

/**
 * Fetches all snippets created by a specific user.
 * @param userId - The ID of the user whose snippets to fetch.
 * @returns A promise that resolves to an array of snippets.
 */
export const getUserSnippets = async (userId: string): Promise<Snippet[]> => {
    if (!userId) {
        return [];
    }

    const q = query(
        collection(db, 'snippets'), 
        where('creatorId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const snippets: Snippet[] = [];
    querySnapshot.forEach((doc) => {
        snippets.push({ id: doc.id, ...doc.data() } as Snippet);
    });

    return snippets;
};
