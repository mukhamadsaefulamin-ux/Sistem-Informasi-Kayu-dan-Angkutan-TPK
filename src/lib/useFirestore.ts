import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export function useFirestoreCollection<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as T));
      // Sort or just set (might want to maintain order by something, but for now just set)
      setData(docs);
    });
    return () => unsubscribe();
  }, [collectionName]);

  const add = async (item: T) => {
    await setDoc(doc(db, collectionName, item.id), item);
  };

  const update = async (id: string, item: Partial<T>) => {
    await setDoc(doc(db, collectionName, id), item, { merge: true });
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  const removeAll = async () => {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      batch.delete(d.ref);
    });
    await batch.commit();
  };

  const replaceAll = async (items: T[]) => {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    // Delete existing
    snapshot.docs.forEach(d => {
      batch.delete(d.ref);
    });
    // Add new
    items.forEach(item => {
      const ref = doc(db, collectionName, item.id);
      batch.set(ref, item);
    });
    await batch.commit();
  };

  return { data, add, update, remove, removeAll, replaceAll, setData };
}
