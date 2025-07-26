



import { db, auth } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, setDoc, deleteDoc, getDoc, writeBatch, updateDoc, increment, Timestamp, documentId, runTransaction, limit, onSnapshot, Unsubscribe, arrayUnion, arrayRemove } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import type { Snippet } from '@/types/snippet';
import type { UserProfile } from '@/types/user';
import type { Comment } from '@/types/comment';
import type { Folder } from '@/types/folder';

type UserDetails = {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
}

// Type for the data being sent to Firestore, omitting fields that are auto-generated or client-side
type SnippetInput = Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'author' | 'authorUsername' | 'avatar' | 'starCount' | 'saveCount' | 'commentCount' | 'isStarred' | 'isSaved' | 'dataAiHint'>;
type SnippetUpdateData = Partial<Omit<Snippet, 'id' | 'creatorId' | 'author' | 'avatar' | 'createdAt' | 'starCount' | 'saveCount' | 'commentCount'>>;

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
        
        // Improved username generation
        const baseUsername = (displayName || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        let username = baseUsername;
        try {
            // Check if username exists, if so, append a random string.
            // This is a simplified check; for production, a more robust unique username generation might be needed.
            const q = query(collection(db, "users"), where("username", "==", baseUsername), limit(1));
            const existingUserSnapshot = await getDocs(q);

            if (!existingUserSnapshot.empty) {
                username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`;
            }

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
        const isTaken = querySnapshot.docs.some(doc => doc.id !== userId);
        if (isTaken) {
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
        if(Object.keys(updateData).length > 0) {
            batch.update(snippetRef, updateData);
        }
    });

    await batch.commit();

    // 3. Update Firebase Auth profile
    const authProfileUpdate: { displayName?: string | null, photoURL?: string | null } = {};
    if (profileData.name) authProfileUpdate.displayName = profileData.name;
    if (profileData.avatar) authProfileUpdate.photoURL = profileData.avatar;

    if (Object.keys(authProfileUpdate).length > 0) {
        await updateProfile(user, authProfileUpdate);
    }
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
  if(!userProfileSnap.exists()) {
    throw new Error("User profile does not exist.");
  }
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
    commentCount: 0,
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

    const snippetRef = doc(db, "snippets", snippet.id);
    const starDocRef = doc(getInteractionCollection(userId, 'starred'), snippet.id);

    await runTransaction(db, async (transaction) => {
        const snippetDoc = await transaction.get(snippetRef);
        if (!snippetDoc.exists()) {
            throw "Snippet does not exist!";
        }
        transaction.update(snippetRef, { starCount: (snippetDoc.data().starCount || 0) + 1 });
        transaction.set(starDocRef, { snippetId: snippet.id, starredAt: serverTimestamp() });
    });
};

export const unstarSnippet = async (userId: string, snippetId: string) => {
    if (!userId || !snippetId) throw new Error("User ID and snippet ID are required.");
    
    const snippetRef = doc(db, "snippets", snippetId);
    const starDocRef = doc(getInteractionCollection(userId, 'starred'), snippetId);

    await runTransaction(db, async (transaction) => {
        const snippetDoc = await transaction.get(snippetRef);
        if (snippetDoc.exists() && (snippetDoc.data().starCount || 0) > 0) {
            transaction.update(snippetRef, { starCount: increment(-1) });
        }
        transaction.delete(starDocRef);
    });
};

export const saveSnippet = async (userId: string, snippet: Snippet) => {
    if (!userId || !snippet || !snippet.id) throw new Error("User ID and snippet ID are required.");

    const snippetRef = doc(db, "snippets", snippet.id);
    const saveDocRef = doc(getInteractionCollection(userId, 'saved'), snippet.id);
    
    await runTransaction(db, async (transaction) => {
        const snippetDoc = await transaction.get(snippetRef);
        if (!snippetDoc.exists()) {
            throw "Snippet does not exist!";
        }
        transaction.update(snippetRef, { saveCount: (snippetDoc.data().saveCount || 0) + 1 });
        transaction.set(saveDocRef, { snippetId: snippet.id, savedAt: serverTimestamp() });
    });
};

export const unsaveSnippet = async (userId: string, snippetId: string) => {
    if (!userId || !snippetId) throw new Error("User ID and snippet ID are required.");
    
    const snippetRef = doc(db, "snippets", snippetId);
    const saveDocRef = doc(getInteractionCollection(userId, 'saved'), snippetId);

    await runTransaction(db, async (transaction) => {
        const snippetDoc = await transaction.get(snippetRef);
        if (snippetDoc.exists() && (snippetDoc.data().saveCount || 0) > 0) {
            transaction.update(snippetRef, { saveCount: increment(-1) });
        }
        transaction.delete(saveDocRef);
    });
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

export const getUserProfileByUid = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { uid: userSnap.id, ...userSnap.data() } as UserProfile;
    }
    return null;
}

/**
 * Finds a user profile by their username.
 * @param username The username to search for.
 * @returns The user profile object or null if not found.
 */
export const findUserByUsername = async (username: string): Promise<UserProfile | null> => {
    if (!username) return null;
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userProfile = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    
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

// --- Comments Functionality ---

/**
 * Adds a comment to a snippet.
 */
export const addComment = async (snippetId: string, userId: string, text: string) => {
    if (!snippetId || !userId || !text) throw new Error("Missing required fields for comment.");

    const userProfile = await getUserProfileByUid(userId);
    if (!userProfile) throw new Error("User profile not found.");

    const commentCollection = collection(db, 'snippets', snippetId, 'comments');
    const snippetRef = doc(db, 'snippets', snippetId);

    await runTransaction(db, async (transaction) => {
        transaction.update(snippetRef, { commentCount: increment(1) });
        transaction.set(doc(commentCollection), {
            text,
            authorId: userId,
            authorName: userProfile.name,
            authorAvatar: userProfile.avatar,
            authorUsername: userProfile.username,
            createdAt: serverTimestamp(),
        });
    });
};

/**
 * Deletes a comment from a snippet.
 */
export const deleteComment = async (snippetId: string, commentId: string) => {
    if (!snippetId || !commentId) throw new Error("Snippet ID and Comment ID are required.");
    
    const commentRef = doc(db, 'snippets', snippetId, 'comments', commentId);
    const snippetRef = doc(db, 'snippets', snippetId);

    await runTransaction(db, async (transaction) => {
        const snippetDoc = await transaction.get(snippetRef);
        if (snippetDoc.exists() && (snippetDoc.data().commentCount || 0) > 0) {
            transaction.update(snippetRef, { commentCount: increment(-1) });
        }
        transaction.delete(commentRef);
    });
};

/**
 * Listens for real-time updates to a snippet's comments.
 */
export const getComments = (snippetId: string, callback: (comments: Comment[]) => void): Unsubscribe => {
    const commentsQuery = query(collection(db, 'snippets', snippetId, 'comments'), orderBy('createdAt', 'desc'));

    return onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
        callback(comments);
    });
};

// --- Folder Functionality ---

const getFoldersCollection = (userId: string) => collection(db, 'users', userId, 'folders');

/**
 * Listens for real-time updates to a user's folders.
 */
export const getFolders = (userId: string, callback: (folders: Folder[]) => void): Unsubscribe => {
    const foldersQuery = query(getFoldersCollection(userId), orderBy('createdAt', 'desc'));

    return onSnapshot(foldersQuery, (snapshot) => {
        const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
        callback(folders);
    });
};

/**
 * Get a single folder's details.
 */
export const getFolder = async (userId: string, folderId: string): Promise<Folder | null> => {
    const folderRef = doc(getFoldersCollection(userId), folderId);
    const folderSnap = await getDoc(folderRef);

    if (folderSnap.exists()) {
        return { id: folderSnap.id, ...folderSnap.data() } as Folder;
    }
    return null;
}

/**
 * Creates a new folder for a user.
 */
export const createFolder = async (userId: string, folderName: string, description: string = '') => {
    await addDoc(getFoldersCollection(userId), {
        name: folderName,
        description: description,
        creatorId: userId,
        snippetIds: [],
        createdAt: serverTimestamp(),
    });
};

/**
 * Deletes a folder.
 */
export const deleteFolder = async (userId: string, folderId: string) => {
    await deleteDoc(doc(getFoldersCollection(userId), folderId));
};

/**
 * Updates a folder's details.
 */
export const updateFolder = async (userId: string, folderId: string, data: Partial<Folder>) => {
    await updateDoc(doc(getFoldersCollection(userId), folderId), data);
};

/**
 * Adds a snippet to a folder.
 */
export const addSnippetToFolder = async (userId: string, folderId: string, snippetId: string) => {
    const folderRef = doc(getFoldersCollection(userId), folderId);
    await updateDoc(folderRef, {
        snippetIds: arrayUnion(snippetId)
    });
};

/**
 * Removes a snippet from a folder.
 */
export const removeSnippetFromFolder = async (userId: string, folderId: string, snippetId: string) => {
    const folderRef = doc(getFoldersCollection(userId), folderId);
    await updateDoc(folderRef, {
        snippetIds: arrayRemove(snippetId)
    });
};

/**
 * Fetches all snippets contained within a specific folder.
 */
export const getSnippetsInFolder = async (userId: string, folderId: string): Promise<Snippet[]> => {
    const folder = await getFolder(userId, folderId);
    if (!folder || folder.snippetIds.length === 0) {
        return [];
    }

    const snippetIds = folder.snippetIds;
    const snippetsData: Snippet[] = [];

    for (let i = 0; i < snippetIds.length; i += 30) {
        const chunk = snippetIds.slice(i, i + 30);
        const snippetsQuery = query(collection(db, 'snippets'), where(documentId(), 'in', chunk));
        const snippetsSnapshot = await getDocs(snippetsQuery);
        snippetsSnapshot.forEach(doc => {
            snippetsData.push({ id: doc.id, ...doc.data() } as Snippet);
        });
    }

    const snippetsMap = new Map(snippetsData.map(snippet => [snippet.id, snippet]));
    
    // Preserve the order from the folder's snippetIds array
    return snippetIds
        .map(id => snippetsMap.get(id))
        .filter(Boolean) as Snippet[];
};
