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
} from 'firebase/firestore';
import type { Collection, Label } from './types';

// In a real app, you'd get this from the logged-in user's auth state
const MOCK_USER_ID = 'user1';

// Collection references
const collectionsRef = collection(db, 'collections');

const getLabelsRef = (collectionId: string) =>
  collection(db, `collections/${collectionId}/labels`);

// Helper to convert a Firestore doc to a typed object
function docToType<T>(document: any): T {
    const data = document.data();
    return {
      id: document.id,
      ...data,
    } as T;
}

export async function getCollections(): Promise<Collection[]> {
  // In a real app, you might query for collections owned by the user
  // or shared with them. For now, we fetch all.
  const snapshot = await getDocs(collectionsRef);
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
  const newCollection: Omit<Collection, 'id'> = {
    ...data,
    ownerId: MOCK_USER_ID, // Replace with actual user ID from auth
    isShared: false,
    labels: [],
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
