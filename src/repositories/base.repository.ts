import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getCountFromServer,
  type WhereFilterOp,
  type WithFieldValue,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore';

export class BaseRepository<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    return collection(db, this.collectionName);
  }

  async findById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async findAll(): Promise<T[]> {
    const q = query(this.collectionRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  }

  async findWhere(field: string, operator: WhereFilterOp, value: unknown): Promise<T[]> {
    const q = query(this.collectionRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, data as WithFieldValue<DocumentData>);
    return docRef.id;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data as UpdateData<DocumentData>);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async count(): Promise<number> {
    const snapshot = await getCountFromServer(this.collectionRef);
    return snapshot.data().count;
  }
}
