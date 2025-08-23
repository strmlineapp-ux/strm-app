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
import type { Collection, Label, LinkedEntity, Project } from './types';

// In a real app, you'd get this from the logged-in user's auth state
const MOCK_USER_ID = 'user1';

// Collection references
const collectionsRef = collection(db, 'collections');
const projectsRef = collection(db, 'projects');
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

// Collections
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

    const labelsSnapshot = await getDocs(getLabelsRef(id));
    collectionData.labels = labelsSnapshot.docs.map(d => docToType<Label>(d));

    return collectionData;
}

export async function createCollection(data: Pick<Collection, 'name' | 'description'>): Promise<string> {
  const newCollection: Omit<Collection, 'id' | 'labels'> = {
    ...data,
    ownerId: MOCK_USER_ID,
    isShared: false,
  };
  const docRef = await addDoc(collectionsRef, newCollection);
  return docRef.id;
}


export async function updateCollection(id: string, data: Partial<Collection>): Promise<void> {
    const collectionDoc = doc(db, "collections", id);
    await updateDoc(collectionDoc, data);
}

export async function deleteCollection(id: string): Promise<void> {
    const collectionDoc = doc(db, "collections", id);
    
    const labelsRef = getLabelsRef(id);
    const labelsSnapshot = await getDocs(labelsRef);
    const batch = writeBatch(db);
    labelsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await deleteDoc(collectionDoc);
}

// Projects
export async function getProjects(): Promise<Project[]> {
    const q = query(projectsRef, where("ownerId", "==", MOCK_USER_ID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Project>(d));
}

export async function getSharedProjects(): Promise<Project[]> {
    const q = query(projectsRef, where("isShared", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Project>(d));
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    const projectDoc = doc(db, "projects", id);
    const snapshot = await getDoc(projectDoc);
    return snapshot.exists() ? docToType<Project>(snapshot) : undefined;
}

export async function createProject(data: Pick<Project, 'name' | 'description'>): Promise<string> {
    const newProject: Omit<Project, 'id'> = {
      ...data,
      ownerId: MOCK_USER_ID,
      isShared: false,
    };
    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
  }
  
  export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
      const projectDoc = doc(db, "projects", id);
      await updateDoc(projectDoc, data);
  }
  
  export async function deleteProject(id: string): Promise<void> {
      const projectDoc = doc(db, "projects", id);
      await deleteDoc(projectDoc);
  }


// Labels
export async function createLabel(data: Omit<Label, 'id' | 'ownerId'>): Promise<string> {
    const newLabel = {
        ...data,
        ownerId: MOCK_USER_ID,
    };
    const labelsRef = getLabelsRef(data.collectionId);
    const docRef = await addDoc(labelsRef, newLabel);
    return docRef.id;
}


export async function updateLabel(collectionId: string, labelId: string, data: Partial<Label>): Promise<void> {
    const labelDoc = doc(db, `collections/${collectionId}/labels`, labelId);
    await updateDoc(labelDoc, data);
}

export async function deleteLabel(collectionId: string, labelId: string): Promise<void> {
    const labelDoc = doc(db, `collections/${collectionId}/labels`, labelId);
    await deleteDoc(labelDoc);
}

// Linking
export async function linkEntity(userId: string, entityId: string, type: 'collection' | 'project'): Promise<void> {
    const linkDocRef = doc(getLinkedEntitiesRef(userId), entityId);
    await setDoc(linkDocRef, { type, linkedAt: new Date() });
}

export async function unlinkEntity(userId: string, entityId: string): Promise<void> {
    const linkDocRef = doc(getLinkedEntitiesRef(userId), entityId);
    await deleteDoc(linkDocRef);
}

export async function getLinkedEntityIds(userId: string, type: 'collection' | 'project'): Promise<string[]> {
    const q = query(getLinkedEntitiesRef(userId), where("type", "==", type));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.id);
}

// Dashboard
export async function getDashboardData(userId: string): Promise<{
    collections: (Collection & { isLinked?: boolean })[],
    projects: (Project & { isLinked?: boolean })[],
}> {
    const ownedCollectionsQuery = query(collectionsRef, where("ownerId", "==", userId));
    const ownedProjectsQuery = query(projectsRef, where("ownerId", "==", userId));

    const linkedCollectionIds = await getLinkedEntityIds(userId, 'collection');
    const linkedProjectIds = await getLinkedEntityIds(userId, 'project');

    const ownedCollectionsPromise = getDocs(ownedCollectionsQuery).then(snap => snap.docs.map(d => docToType<Collection>(d)));
    const ownedProjectsPromise = getDocs(ownedProjectsQuery).then(snap => snap.docs.map(d => docToType<Project>(d)));

    let linkedCollectionsPromise: Promise<Collection[]> = Promise.resolve([]);
    if (linkedCollectionIds.length > 0) {
        const linkedCollectionsQuery = query(collectionsRef, where(documentId(), "in", linkedCollectionIds));
        linkedCollectionsPromise = getDocs(linkedCollectionsQuery).then(snap => snap.docs.map(d => docToType<Collection>(d)));
    }
    
    let linkedProjectsPromise: Promise<Project[]> = Promise.resolve([]);
    if (linkedProjectIds.length > 0) {
        const linkedProjectsQuery = query(projectsRef, where(documentId(), "in", linkedProjectIds));
        linkedProjectsPromise = getDocs(linkedProjectsQuery).then(snap => snap.docs.map(d => docToType<Project>(d)));
    }

    const [ownedCollections, ownedProjects, linkedCollections, linkedProjects] = await Promise.all([
        ownedCollectionsPromise,
        ownedProjectsPromise,
        linkedCollectionsPromise,
        linkedProjectsPromise,
    ]);

    const linkedCollectionsWithFlag = linkedCollections.map(c => ({...c, isLinked: true}));
    const linkedProjectsWithFlag = linkedProjects.map(p => ({...p, isLinked: true}));

    const ownedCollectionIds = new Set(ownedCollections.map(c => c.id));
    const uniqueLinkedCollections = linkedCollectionsWithFlag.filter(c => !ownedCollectionIds.has(c.id));
    
    const ownedProjectIds = new Set(ownedProjects.map(p => p.id));
    const uniqueLinkedProjects = linkedProjectsWithFlag.filter(p => !ownedProjectIds.has(p.id));

    return {
        collections: [...ownedCollections, ...uniqueLinkedCollections],
        projects: [...ownedProjects, ...uniqueLinkedProjects],
    };
}

// These are old functions that are now replaced by more generic ones or combined.
// I'm keeping them here for reference to avoid breaking existing code, but they should be phased out.
export const linkCollection = (userId: string, collectionId: string) => linkEntity(userId, collectionId, 'collection');
export const unlinkCollection = (userId: string, collectionId: string) => unlinkEntity(userId, collectionId);
export const getLinkedCollectionIds = (userId: string) => getLinkedEntityIds(userId, 'collection');
export async function getDashboardCollections(userId: string): Promise<(Collection & { isLinked?: boolean })[]> {
    const { collections } = await getDashboardData(userId);
    return collections;
}
