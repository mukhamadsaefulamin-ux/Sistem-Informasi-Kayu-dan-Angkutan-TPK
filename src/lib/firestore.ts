import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, query } from 'firebase/firestore';
import { db } from './firebase';

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const syncToFirestore = async (collectionName: string, items: any[]) => {
  const q = query(collection(db, collectionName));
  const snapshot = await getDocs(q);
  const existingIds = new Set(snapshot.docs.map(d => d.id));

  // Update or set new docs
  for (const item of items) {
    if (!item.id) continue;
    await setDoc(doc(db, collectionName, item.id), item);
    existingIds.delete(item.id);
  }

  // Delete docs that are no longer in the list
  for (const id of existingIds) {
    await deleteDoc(doc(db, collectionName, id));
  }
};
