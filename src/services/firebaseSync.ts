import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Product, StockMovement } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const MOVEMENTS_COLLECTION = 'movements';
const META_COLLECTION = 'meta';

/**
 * Initializes Firestore with the 302 pharmacy items if not already done.
 */
export async function syncInitialDataToFirestore(
  initialProducts: Product[],
  initialMovements: StockMovement[]
): Promise<boolean> {
  // Only authenticated pharmacy staff can write to Firestore according to security rules
  if (!auth.currentUser) {
    return false;
  }

  // If client is currently offline, skip remote initialization
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('Mode hors-ligne : la synchronisation Firestore se fera lors de la reconnexion.');
    return false;
  }

  const metaRef = doc(db, META_COLLECTION, 'pharmacy');
  try {
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists() && metaSnap.data()?.initialized) {
      return false; // Already initialized in cloud
    }

    // Write in batches of up to 300 operations
    const chunks: Product[][] = [];
    for (let i = 0; i < initialProducts.length; i += 300) {
      chunks.push(initialProducts.slice(i, i + 300));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const p of chunk) {
        const prodRef = doc(db, PRODUCTS_COLLECTION, p.id.toString());
        batch.set(prodRef, {
          id: p.id,
          no: p.no,
          designation: p.designation,
          quantite: p.quantite,
          prixCession: p.prixCession,
          prixVente: p.prixVente,
          seuilAlerte: p.seuilAlerte,
          datePeremption: p.datePeremption || '',
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();
    }

    // Write initial movements
    if (initialMovements.length > 0) {
      const mvtBatch = writeBatch(db);
      for (const m of initialMovements) {
        const mvtRef = doc(db, MOVEMENTS_COLLECTION, m.id);
        mvtBatch.set(mvtRef, {
          id: m.id,
          date: m.date,
          type: m.type,
          productId: m.productId,
          productName: m.productName,
          quantite: m.quantite,
          stockApres: m.stockApres,
          note: m.note || '',
          userId: auth.currentUser?.uid || 'system'
        });
      }
      await mvtBatch.commit();
    }

    // Mark meta as initialized
    await setDoc(metaRef, {
      initialized: true,
      lastUpdated: new Date().toISOString()
    });

    return true;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('offline') || err.message.includes('unavailable'))) {
      console.warn('Mode hors-ligne : données sauvegardées localement en attendant la connexion Firestore.');
      return false;
    }
    handleFirestoreError(err, OperationType.WRITE, META_COLLECTION);
    return false;
  }
}

/**
 * Subscribes to live products collection from Firestore.
 */
export function subscribeToFirestoreProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (error: unknown) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const prods: Product[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        prods.push({
          id: Number(d.id || docSnap.id),
          no: Number(d.no) || 1,
          designation: String(d.designation || ''),
          quantite: Number(d.quantite) || 0,
          prixCession: Number(d.prixCession) || 0,
          prixVente: Number(d.prixVente) || 0,
          seuilAlerte: Number(d.seuilAlerte) || 10,
          datePeremption: d.datePeremption ? String(d.datePeremption) : ''
        });
      });
      // Sort by order number
      prods.sort((a, b) => a.no - b.no);
      if (prods.length > 0) {
        onSuccess(prods);
      }
    },
    error => {
      console.warn('Erreur temps réel Firestore Products (mode local actif):', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    }
  );
}

/**
 * Subscribes to live movements collection from Firestore.
 */
export function subscribeToFirestoreMovements(
  onSuccess: (movements: StockMovement[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(collection(db, MOVEMENTS_COLLECTION), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const mvts: StockMovement[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        mvts.push({
          id: String(d.id || docSnap.id),
          date: String(d.date || new Date().toISOString()),
          type: d.type as 'entree' | 'sortie' | 'ajustement',
          productId: Number(d.productId),
          productName: String(d.productName || ''),
          quantite: Number(d.quantite),
          stockApres: Number(d.stockApres),
          note: String(d.note || '')
        });
      });
      if (mvts.length > 0) {
        onSuccess(mvts);
      }
    },
    error => {
      console.warn('Erreur temps réel Firestore Movements:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, MOVEMENTS_COLLECTION);
    }
  );
}

/**
 * Saves a single product to Firestore.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, product.id.toString());
    await setDoc(
      prodRef,
      {
        id: product.id,
        no: product.no,
        designation: product.designation,
        quantite: product.quantite,
        prixCession: product.prixCession,
        prixVente: product.prixVente,
        seuilAlerte: product.seuilAlerte,
        datePeremption: product.datePeremption || '',
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProductFromFirestore(productId: number): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, productId.toString());
    await deleteDoc(prodRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Commits a movement and updates product stock in Firestore atomically.
 */
export async function recordMovementInFirestore(
  movement: StockMovement,
  newStock: number
): Promise<void> {
  const path = `${MOVEMENTS_COLLECTION}/${movement.id}`;
  try {
    const batch = writeBatch(db);

    // Save movement document
    const mvtRef = doc(db, MOVEMENTS_COLLECTION, movement.id);
    batch.set(mvtRef, {
      id: movement.id,
      date: movement.date,
      type: movement.type,
      productId: movement.productId,
      productName: movement.productName,
      quantite: movement.quantite,
      stockApres: movement.stockApres,
      note: movement.note || '',
      userId: auth.currentUser?.uid || 'anonyme'
    });

    // Update product document
    const prodRef = doc(db, PRODUCTS_COLLECTION, movement.productId.toString());
    batch.update(prodRef, {
      quantite: newStock,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Batch updates physical inventory adjustments.
 */
export async function applyPhysicalInventoryInFirestore(
  adjustments: { product: Product; newStock: number; movement: StockMovement }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const item of adjustments) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.product.id.toString());
      batch.update(prodRef, {
        quantite: item.newStock,
        updatedAt: new Date().toISOString()
      });

      const mvtRef = doc(db, MOVEMENTS_COLLECTION, item.movement.id);
      batch.set(mvtRef, {
        id: item.movement.id,
        date: item.movement.date,
        type: item.movement.type,
        productId: item.movement.productId,
        productName: item.movement.productName,
        quantite: item.movement.quantite,
        stockApres: item.movement.stockApres,
        note: item.movement.note || '',
        userId: auth.currentUser?.uid || 'anonyme'
      });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}
