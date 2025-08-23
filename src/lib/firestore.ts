// This is a placeholder for Firestore interactions.
// In a real application, you would initialize Firebase here
// and export functions to interact with your collections.

import { Collection, Label } from './types';

// MOCK DATA
const MOCK_LABELS: Label[] = [
  { id: '1', collectionId: '1', name: 'High Priority', color: '#ff0000', icon: 'Flag', description: 'For critical tasks', ownerId: 'user1', assignPermissions: { type: 'team_admins' } },
  { id: '2', collectionId: '1', name: 'Design Review', color: '#0000ff', icon: 'Palette', description: 'Needs design feedback', ownerId: 'user1', assignPermissions: { type: 'anyone' } },
  { id: '3', collectionId: '2', name: 'Backend', color: '#00ff00', icon: 'Server', description: 'Backend-related tasks', ownerId: 'user2', assignPermissions: { type: 'team_members' } },
];


const MOCK_COLLECTIONS: Collection[] = [
  { id: '1', name: 'Project Alpha', description: 'Collection for the Alpha project deliverables.', ownerId: 'user1', isShared: false, labels: MOCK_LABELS.filter(l => l.collectionId === '1') },
  { id: '2', name: 'Marketing Campaigns', description: 'Collection for Q3 marketing assets.', ownerId: 'user2', isShared: true, labels: MOCK_LABELS.filter(l => l.collectionId === '2') },
  { id: '3', name: 'Shared Design System', description: 'Official company-wide design components.', ownerId: 'user3', isShared: true },
];

// Mock functions to simulate Firestore calls
export async function getCollections(): Promise<Collection[]> {
  console.log("Fetching collections...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_COLLECTIONS;
}

export async function getCollectionById(id: string): Promise<Collection | undefined> {
  console.log(`Fetching collection ${id}...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const collection = MOCK_COLLECTIONS.find(c => c.id === id);
  if (collection && !collection.labels) {
    collection.labels = MOCK_LABELS.filter(l => l.collectionId === id);
  }
  return collection;
}

export async function createCollection(collection: Omit<Collection, 'id' | 'ownerId'>): Promise<Collection> {
  console.log("Creating collection...", collection);
  await new Promise(resolve => setTimeout(resolve, 500));
  const newCollection: Collection = {
    ...collection,
    id: String(MOCK_COLLECTIONS.length + 1),
    ownerId: 'currentUser', // Replace with actual user ID
    isShared: false,
  };
  MOCK_COLLECTIONS.push(newCollection);
  return newCollection;
}

export async function updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
  console.log(`Updating collection ${id}...`, data);
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = MOCK_COLLECTIONS.findIndex(c => c.id === id);
  if (index !== -1) {
    MOCK_COLLECTIONS[index] = { ...MOCK_COLLECTIONS[index], ...data };
    return MOCK_COLLECTIONS[index];
  }
  throw new Error("Collection not found");
}

export async function createLabel(label: Omit<Label, 'id' | 'ownerId'>): Promise<Label> {
    console.log("Creating label...", label);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newLabel: Label = {
      ...label,
      id: String(MOCK_LABELS.length + 1),
      ownerId: 'currentUser', // Replace with actual user ID
    };
    MOCK_LABELS.push(newLabel);
    // Add to parent collection mock
    const collection = MOCK_COLLECTIONS.find(c => c.id === newLabel.collectionId);
    if(collection) {
        if(!collection.labels) collection.labels = [];
        collection.labels.push(newLabel);
    }
    return newLabel;
  }
