
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, setDoc, deleteDoc, getDoc, writeBatch, updateDoc, increment } from 'firebase/firestore';
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
 * Deletes a snippet from Firestore.
 * @param snippetId - The ID of the snippet to delete.
 */
export const deleteSnippet = async (snippetId: string) => {
    if (!snippetId) {
        throw new Error('Snippet ID is required to delete a snippet.');
    }
    const snippetRef = doc(db, 'snippets', snippetId);
    await deleteDoc(snippetRef);
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

/**
 * Fetches all public snippets for the explore page.
 * @returns A promise that resolves to an array of public snippets.
 */
export const getPublicSnippets = async (): Promise<Snippet[]> => {
    const q = query(
        collection(db, 'snippets'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));
}


// --- Star/Save Functionality ---

const getInteractionCollection = (userId: string, type: 'starred' | 'saved') => {
    return collection(db, 'users', userId, `${type}Snippets`);
}

export const starSnippet = async (userId: string, snippet: Snippet) => {
    if (!userId || !snippet || !snippet.id) throw new Error("User ID and snippet ID are required.");
    
    const batch = writeBatch(db);
    
    const starDocRef = doc(getInteractionCollection(userId, 'starred'), snippet.id);
    batch.set(starDocRef, { ...snippet, starredAt: serverTimestamp() });

    const snippetRef = doc(db, "snippets", snippet.id);
    batch.update(snippetRef, { starCount: increment(1) });
    
    await batch.commit();
};

export const unstarSnippet = async (userId: string, snippetId: string) => {
    if (!userId || !snippetId) throw new Error("User ID and snippet ID are required.");

    const batch = writeBatch(db);

    const starDocRef = doc(getInteractionCollection(userId, 'starred'), snippetId);
    batch.delete(starDocRef);

    const snippetRef = doc(db, "snippets", snippetId);
    batch.update(snippetRef, { starCount: increment(-1) });

    await batch.commit();
};

export const saveSnippet = async (userId: string, snippet: Snippet) => {
    if (!userId || !snippet || !snippet.id) throw new Error("User ID and snippet ID are required.");
    const saveDocRef = doc(getInteractionCollection(userId, 'saved'), snippet.id);
    await setDoc(saveDocRef, { ...snippet, savedAt: serverTimestamp() });
};

export const unsaveSnippet = async (userId: string, snippetId: string) => {
    if (!userId || !snippetId) throw new Error("User ID and snippet ID are required.");
    const saveDocRef = doc(getInteractionCollection(userId, 'saved'), snippetId);
    await deleteDoc(saveDocRef);
};


export const getStarredSnippets = async (userId: string): Promise<Snippet[]> => {
    if (!userId) return [];
    const q = query(getInteractionCollection(userId, 'starred'), orderBy('starredAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));
};

export const getSavedSnippets = async (userId: string): Promise<Snippet[]> => {
    if (!userId) return [];
    const q = query(getInteractionCollection(userId, 'saved'), orderBy('savedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));
};


export const getUserInteractionStatus = async (userId: string, snippetIds: string[]): Promise<{ starred: Set<string>, saved: Set<string> }> => {
    if (!userId || snippetIds.length === 0) {
        return { starred: new Set(), saved: new Set() };
    }

    const starredRef = getInteractionCollection(userId, 'starred');
    const savedRef = getInteractionCollection(userId, 'saved');

    const starredPromises = snippetIds.map(id => getDoc(doc(starredRef, id)));
    const savedPromises = snippetIds.map(id => getDoc(doc(savedRef, id)));

    const [starredDocs, savedDocs] = await Promise.all([
        Promise.all(starredPromises),
        Promise.all(savedPromises)
    ]);

    const starred = new Set(starredDocs.filter(d => d.exists()).map(d => d.id));
    const saved = new Set(savedDocs.filter(d => d.exists()).map(d => d.id));

    return { starred, saved };
};