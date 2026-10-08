import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "products";

export const DEFAULT_CATEGORIES = ["Shapes", "Completes", "Peças", "Acessórios"];

export function subscribeProducts(onData, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data({ serverTimestamps: "estimate" }),
      }));
      list.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
      );
      onData(list);
    },
    onError,
  );
}

export async function saveProduct(data, id) {
  if (id) {
    await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export const deleteProduct = (id) => deleteDoc(doc(db, COLLECTION, id));
