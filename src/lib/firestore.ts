import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  documentId,
  setDoc,
} from 'firebase/firestore';
import type { Collection, Label, LinkedEntity } from './types';

// In a real app, you'd get this from the logged-in user's auth state
const MOCK_USER_ID = 'user1';

// Collection references
const collectionsRef = collection(db, 'collections');
const getUsersRef = () => collection(db, 'users');

const getLabelsRef = (collectionId: string) =>
  collection(db, `collections/${collectionId}/labels`);

const getLinkedEntitiesRef = (userId: string) =>
    collection(db, `users/${userId}/linkedEntities`);

// Helper to convert a Firestore doc to a typed object
function docToType<T>(document: any): T {
    const data = document.data();
    return {
      id: document.id,
      ...data,
    } as T;
}

export async function getCollections(): Promise<Collection[]> {
  const q = query(collectionsRef, where("ownerId", "==", MOCK_USER_ID));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => docToType<Collection>(d));
}

export async function getSharedCollections(): Promise<Collection[]> {
    const q = query(collectionsRef, where("isShared", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Collection>(d));
}


export async function getCollectionById(id: string): Promise<Collection | undefined> {
    const collectionDoc = doc(db, "collections", id);
    const snapshot = await getDoc(collectionDoc);

    if (!snapshot.exists()) {
        return undefined;
    }

    const collectionData = docToType<Collection>(snapshot);

    // Get subcollection of labels
    const labelsSnapshot = await getDocs(getLabelsRef(id));
    collectionData.labels = labelsSnapshot.docs.map(d => docToType<Label>(d));

    return collectionData;
}

export async function createCollection(data: Pick<Collection, 'name' | 'description'>): Promise<string> {
  const newCollection: Omit<Collection, 'id' | 'labels'> = {
    ...data,
    ownerId: MOCK_USER_ID, // Replace with actual user ID from auth
    isShared: false,
  };
  const docRef = await addDoc(collectionsRef, newCollection);
  return docRef.id;
}


export async function updateCollection(id: string, data: Partial<Collection>): Promise<void> {
    const collectionDoc = doc(db, "collections", id);
    // You should add security rules to ensure only the owner can update.
    await updateDoc(collectionDoc, data);
}

export async function deleteCollection(id: string): Promise<void> {
    const collectionDoc = doc(db, "collections", id);
    // You should add security rules to ensure only the owner can delete.
    
    // Also delete subcollections (labels)
    const labelsRef = getLabelsRef(id);
    const labelsSnapshot = await getDocs(labelsRef);
    const batch = writeBatch(db);
    labelsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await deleteDoc(collectionDoc);
}


export async function createLabel(data: Omit<Label, 'id' | 'ownerId'>): Promise<string> {
    const newLabel = {
        ...data,
        ownerId: MOCK_USER_ID, // Replace with actual user ID from auth
    };
    const labelsRef = getLabelsRef(data.collectionId);
    const docRef = await addDoc(labelsRef, newLabel);
    return docRef.id;
}


export async function updateLabel(collectionId: string, labelId: string, data: Partial<Label>): Promise<void> {
    const labelDoc = doc(db, `collections/${collectionId}/labels`, labelId);
    // Add security rules for this
    await updateDoc(labelDoc, data);
}

export async function deleteLabel(collectionId: string, labelId: string): Promise<void> {
    const labelDoc = doc(db, `collections/${collectionId}/labels`, labelId);
    // Add security rules for this
    await deleteDoc(labelDoc);
}

export async function linkCollection(userId: string, collectionId: string): Promise<void> {
    const linkDocRef = doc(getLinkedEntitiesRef(userId), collectionId);
    await setDoc(linkDocRef, { type: "collection", linkedAt: new Date() });
}

export async function unlinkCollection(userId: string, collectionId: string): Promise<void> {
    const linkDocRef = doc(getLinkedEntitiesRef(userId), collectionId);
    await deleteDoc(linkDocRef);
}

export async function getLinkedCollectionIds(userId: string): Promise<string[]> {
    const q = query(getLinkedEntitiesRef(userId), where("type", "==", "collection"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.id);
}

export async function getDashboardCollections(userId: string): Promise<(Collection & { isLinked?: boolean })[]> {
    const ownedCollectionsQuery = query(collectionsRef, where("ownerId", "==", userId));
    const linkedCollectionIds = await getLinkedCollectionIds(userId);

    const ownedPromise = getDocs(ownedCollectionsQuery).then(snap => snap.docs.map(d => docToType<Collection>(d)));

    let linkedPromise: Promise<Collection[]> = Promise.resolve([]);
    if (linkedCollectionIds.length > 0) {
        const linkedCollectionsQuery = query(collectionsRef, where(documentId(), "in", linkedCollectionIds));
        linkedPromise = getDocs(linkedCollectionsQuery).then(snap => snap.docs.map(d => docToType<Collection>(d)));
    }
    
    const [ownedCollections, linkedCollections] = await Promise.all([ownedPromise, linkedPromise]);

    const linkedCollectionsWithFlag = linkedCollections.map(c => ({...c, isLinked: true}));

    // In case a user links their own collection, filter out duplicates
    const ownedIds = new Set(ownedCollections.map(c => c.id));
    const uniqueLinked = linkedCollectionsWithFlag.filter(c => !ownedIds.has(c.id));

    return [...ownedCollections, ...uniqueLinked];
}
