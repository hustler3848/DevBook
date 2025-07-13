
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, setDoc, deleteDoc, getDoc, writeBatch, updateDoc, increment, FieldValue } from 'firebase/firestore';
import type { Snippet } from '@/types/snippet';

type UserDetails = {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
}

// Type for the data being sent to Firestore, omitting the `id` which is auto-generated
type SnippetData = Omit<Snippet, 'id' | 'createdAt' | 'author' | 'avatar' | 'dataAiHint'>;

/**
 * Adds a new snippet to the user's collection in Firestore.
 * @param user - The authenticated user object.
 * @param data - The snippet data to be saved.
 */
export const addSnippet = async (user: UserDetails, data: SnippetData) => {
  if (!user || !user.uid) {
    throw new Error('User ID is required to add a snippet.');
  }
  
  await addDoc(collection(db, 'snippets'), {
    ...data,
    creatorId: user.uid,
    author: user.displayName || 'Anonymous',
    avatar: user.photoURL || `https://placehold.co/40x40.png`,
    dataAiHint: 'user avatar',
    createdAt: serverTimestamp(),
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
export const getPublicSnippets = async (userId?: string): Promise<Snippet[]> => {
    const q = query(
        collection(db, 'snippets'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const snippets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));

    if (userId) {
      if (snippets.length === 0) return snippets;

      const { starred, saved } = await getUserInteractionStatus(userId);
      return snippets.map(snippet => ({
        ...snippet,
        isStarred: starred.has(snippet.id),
        isSaved: saved.has(snippet.id),
      }));
    }

    return snippets;
}


// --- Star/Save Functionality ---

const getInteractionCollection = (userId: string, type: 'starred' | 'saved') => {
    return collection(db, 'users', userId, `${type}Snippets`);
}

export const starSnippet = async (userId: string, snippet: Snippet) => {
    if (!userId || !snippet || !snippet.id) throw new Error("User ID and snippet ID are required.");
    
    const batch = writeBatch(db);
    
    const starDocRef = doc(getInteractionCollection(userId, 'starred'), snippet.id);
    const snippetToStar = { ...snippet, starredAt: serverTimestamp() };
    delete snippetToStar.isStarred; // don't store interaction state in the interaction doc
    delete snippetToStar.isSaved;
    batch.set(starDocRef, snippetToStar);

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
    const snippetToSave = { ...snippet, savedAt: serverTimestamp() };
    delete snippetToSave.isStarred; // don't store interaction state in the interaction doc
    delete snippetToSave.isSaved;
    await setDoc(saveDocRef, snippetToSave);
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isStarred: true, isSaved: false } as Snippet));
};

export const getSavedSnippets = async (userId: string): Promise<Snippet[]> => {
    if (!userId) return [];
    const q = query(getInteractionCollection(userId, 'saved'), orderBy('savedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isSaved: true, isStarred: false } as Snippet));
};


export const getUserInteractionStatus = async (userId: string): Promise<{ starred: Set<string>, saved: Set<string> }> => {
    if (!userId) {
        return { starred: new Set(), saved: new Set() };
    }

    const starredRef = getInteractionCollection(userId, 'starred');
    const savedRef = getInteractionCollection(userId, 'saved');

    const [starredSnapshot, savedSnapshot] = await Promise.all([
        getDocs(query(starredRef)),
        getDocs(query(savedRef))
    ]);

    const starred = new Set(starredSnapshot.docs.map(d => d.id));
    const saved = new Set(savedSnapshot.docs.map(d => d.id));

    return { starred, saved };
};
