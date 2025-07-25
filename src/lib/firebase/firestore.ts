
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, setDoc, deleteDoc, getDoc, writeBatch, updateDoc, increment, Timestamp, documentId } from 'firebase/firestore';
import type { Snippet } from '@/types/snippet';

type UserDetails = {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
}

// Type for the data being sent to Firestore, omitting fields that are auto-generated or client-side
type SnippetInput = Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'author' | 'avatar' | 'starCount' | 'saveCount' | 'isStarred' | 'isSaved'>;
type SnippetUpdateData = Partial<Omit<Snippet, 'id' | 'creatorId' | 'author' | 'avatar' | 'createdAt' | 'starCount' | 'saveCount'>>;


/**
 * Adds a new snippet to the user's collection in Firestore.
 */
export const addSnippet = async (user: UserDetails, data: SnippetInput) => {
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
    updatedAt: serverTimestamp(),
    starCount: 0,
    saveCount: 0,
  });
};

/**
 * Updates an existing snippet in Firestore.
 */
export const updateSnippet = async (snippetId: string, updates: SnippetUpdateData) => {
    if (!snippetId) {
        throw new Error('Snippet ID is required to update.');
    }
    const snippetRef = doc(db, 'snippets', snippetId);
    await updateDoc(snippetRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};


/**
 * Deletes a snippet from Firestore.
 * This should also trigger a cloud function to delete related user interactions (stars, saves).
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

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));
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

    if (userId && snippets.length > 0) {
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
    
    // Use a lightweight reference in the user's subcollection
    const starDocRef = doc(getInteractionCollection(userId, 'starred'), snippet.id);
    batch.set(starDocRef, { snippetId: snippet.id, starredAt: serverTimestamp() });

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
    const snippetDoc = await getDoc(snippetRef);

    if (snippetDoc.exists() && (snippetDoc.data().starCount || 0) > 0) {
        batch.update(snippetRef, { starCount: increment(-1) });
    }

    await batch.commit();
};

export const saveSnippet = async (userId: string, snippet: Snippet) => {
    if (!userId || !snippet || !snippet.id) throw new Error("User ID and snippet ID are required.");
    const batch = writeBatch(db);

    const saveDocRef = doc(getInteractionCollection(userId, 'saved'), snippet.id);
    batch.set(saveDocRef, { snippetId: snippet.id, savedAt: serverTimestamp() });

    const snippetRef = doc(db, 'snippets', snippet.id);
    batch.update(snippetRef, { saveCount: increment(1) });
    
    await batch.commit();
};

export const unsaveSnippet = async (userId: string, snippetId: string) => {
    if (!userId || !snippetId) throw new Error("User ID and snippet ID are required.");
    
    const batch = writeBatch(db);
    
    const saveDocRef = doc(getInteractionCollection(userId, 'saved'), snippetId);
    batch.delete(saveDocRef);

    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (snippetDoc.exists() && (snippetDoc.data().saveCount || 0) > 0) {
        batch.update(snippetRef, { saveCount: increment(-1) });
    }

    await batch.commit();
};


const fetchInteractionSnippets = async (userId: string, type: 'starred' | 'saved'): Promise<Snippet[]> => {
    if (!userId) return [];
    
    const interactionCollection = getInteractionCollection(userId, type);
    const q = query(interactionCollection, orderBy(`${type}At`, 'desc'));
    const interactionSnapshot = await getDocs(q);
    
    if (interactionSnapshot.empty) return [];
    
    const snippetIds = interactionSnapshot.docs.map(doc => doc.data().snippetId);
    if (snippetIds.length === 0) return [];


    // Now fetch the full snippet documents
    // Firestore 'in' queries are limited to 30 items per query.
    // For a production app, this should be handled with multiple queries if needed.
    const snippetsQuery = query(collection(db, 'snippets'), where(documentId(), 'in', snippetIds));
    const snippetsSnapshot = await getDocs(snippetsQuery);
    
    const snippetsMap = new Map(snippetsSnapshot.docs.map(doc => [doc.id, doc.data() as Snippet]));
    
    // Preserve the order from the interaction query
    const results = snippetIds
        .map((id: string) => {
            const snippet = snippetsMap.get(id);
            // Only return snippets that were actually found
            return snippet ? { id, ...snippet } : null;
        })
        .filter(Boolean) as Snippet[];

    return results.map(snippet => ({
        ...snippet,
        isStarred: type === 'starred' ? true : undefined,
        isSaved: type === 'saved' ? true : undefined
    }));
};


export const getStarredSnippets = (userId: string): Promise<Snippet[]> => {
    return fetchInteractionSnippets(userId, 'starred');
};

export const getSavedSnippets = (userId: string): Promise<Snippet[]> => {
    return fetchInteractionSnippets(userId, 'saved');
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
