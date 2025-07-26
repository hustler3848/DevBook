
import { db, auth } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, setDoc, deleteDoc, getDoc, writeBatch, updateDoc, increment, Timestamp, documentId, runTransaction, limit } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import type { Snippet } from '@/types/snippet';
import type { UserProfile } from '@/types/user';

type UserDetails = {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
}

// Type for the data being sent to Firestore, omitting fields that are auto-generated or client-side
type SnippetInput = Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'author' | 'authorUsername' | 'avatar' | 'starCount' | 'saveCount' | 'isStarred' | 'isSaved' | 'dataAiHint'>;
type SnippetUpdateData = Partial<Omit<Snippet, 'id' | 'creatorId' | 'author' | 'avatar' | 'createdAt' | 'starCount' | 'saveCount'>>;

/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * This is typically called on user sign-up.
 * @param user - The Firebase Auth user object.
 * @param additionalData - Any additional data to store in the profile.
 */
export const createUserProfileDocument = async (user: UserDetails, additionalData: Partial<UserProfile> = {}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { displayName, photoURL } = user;
        const createdAt = serverTimestamp();
        const username = (displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.random().toString(36).substring(2, 6);

        try {
            await setDoc(userRef, {
                uid: user.uid,
                name: displayName,
                username: username,
                avatar: photoURL || `https://placehold.co/128x128.png`,
                bio: '',
                social: { github: '', twitter: '', linkedin: '' },
                createdAt,
                ...additionalData,
            });
        } catch (error) {
            console.error("Error creating user profile document: ", error);
        }
    }
};


/**
 * Updates a user's profile information in Auth and Firestore.
 * Also updates their information across all their snippets.
 * @param userId The user's unique ID.
 * @param profileData The new profile data.
 */
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    if (!userId || !auth.currentUser || userId !== auth.currentUser.uid) {
        throw new Error("You can only update your own profile.");
    }
    
    // Check if username is being changed and if it's already taken
    if (profileData.username) {
        const q = query(collection(db, 'users'), where('username', '==', profileData.username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty && querySnapshot.docs[0].id !== userId) {
            throw new Error('Username is already taken. Please choose another.');
        }
    }

    const userRef = doc(db, 'users', userId);
    const user = auth.currentUser;

    const batch = writeBatch(db);

    // 1. Update Firestore user profile
    batch.update(userRef, profileData);

    // 2. Update author details on all of the user's snippets
    const snippetsQuery = query(collection(db, 'snippets'), where('creatorId', '==', userId));
    const snippetsSnapshot = await getDocs(snippetsQuery);
    
    snippetsSnapshot.forEach(snippetDoc => {
        const snippetRef = doc(db, 'snippets', snippetDoc.id);
        const updateData: any = {};
        if (profileData.name) updateData.author = profileData.name;
        if (profileData.username) updateData.authorUsername = profileData.username;
        if (profileData.avatar) updateData.avatar = profileData.avatar;
        batch.update(snippetRef, updateData);
    });

    await batch.commit();

    // 3. Update Firebase Auth profile
    await updateProfile(user, {
        displayName: profileData.name,
        photoURL: profileData.avatar,
    });
};


/**
 * Adds a new snippet to the user's collection in Firestore.
 */
export const addSnippet = async (user: UserDetails, data: SnippetInput) => {
  if (!user || !user.uid) {
    throw new Error('User ID is required to add a snippet.');
  }

  const userProfileRef = doc(db, 'users', user.uid);
  const userProfileSnap = await getDoc(userProfileRef);
  const userProfile = userProfileSnap.data() as UserProfile;
  
  await addDoc(collection(db, 'snippets'), {
    ...data,
    creatorId: user.uid,
    author: user.displayName || 'Anonymous',
    authorUsername: userProfile?.username || 'anonymous',
    avatar: user.photoURL || `https://placehold.co/40x40.png`,
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

    const snippetsData: Snippet[] = [];
    // Firestore 'in' queries are limited to 30 items. Chunk the array.
    for (let i = 0; i < snippetIds.length; i += 30) {
        const chunk = snippetIds.slice(i, i + 30);
        const snippetsQuery = query(collection(db, 'snippets'), where(documentId(), 'in', chunk));
        const snippetsSnapshot = await getDocs(snippetsQuery);
        snippetsSnapshot.forEach(doc => {
            snippetsData.push({ id: doc.id, ...doc.data() } as Snippet);
        });
    }

    const snippetsMap = new Map(snippetsData.map(snippet => [snippet.id, snippet]));
    
    // Preserve the order from the interaction query
    const results = snippetIds
        .map((id: string) => {
            const snippet = snippetsMap.get(id);
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

/**
 * Finds a user profile by their username. If an authenticated user ID is provided and matches
 * the profile user's ID, it will also fetch their private stats.
 * @param username The username to search for.
 * @param authUserId (Optional) The ID of the currently authenticated user.
 * @returns The user profile object or null if not found.
 */
export const findUserByUsername = async (username: string, authUserId?: string): Promise<UserProfile | null> => {
    if (!username) return null;
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile;

    // If the authenticated user is viewing their own profile, fetch their stats
    if (authUserId && authUserId === userProfile.uid) {
        const savedSnippets = await getSavedSnippets(authUserId);
        const starredSnippets = await getStarredSnippets(authUserId);
        userProfile.stats = {
            created: 0, // This will be counted from public snippets on the client
            saved: savedSnippets.length,
            starred: starredSnippets.length,
        };
    }

    return userProfile;
}

/**
 * Fetches all public snippets created by a specific user.
 * @param userId - The ID of the user whose public snippets to fetch.
 * @returns A promise that resolves to an array of snippets.
 */
export const getPublicSnippetsForUser = async (userId: string): Promise<Snippet[]> => {
    if (!userId) return [];

    const q = query(
        collection(db, 'snippets'),
        where('creatorId', '==', userId),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));
};
