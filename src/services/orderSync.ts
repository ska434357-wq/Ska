import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { PurchaseOrder, OrderItem } from '../types/order';
import { Product, StockMovement } from '../data/initialProducts';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const MOVEMENTS_COLLECTION = 'movements';
const LOCAL_STORAGE_ORDERS_KEY = 'laafi_pharmacy_orders_v1';

/**
 * Loads orders from localStorage fallback.
 */
export function loadOrdersFromLocalStorage(): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erreur chargement commandes locales:', e);
    return [];
  }
}

/**
 * Saves orders to localStorage fallback.
 */
export function saveOrdersToLocalStorage(orders: PurchaseOrder[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Erreur sauvegarde commandes locales:', e);
  }
}

/**
 * Subscribes to orders from Firestore in real time.
 */
export function subscribeToFirestoreOrders(
  onSuccess: (orders: PurchaseOrder[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const orders: PurchaseOrder[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        orders.push({
          id: String(d.id || docSnap.id),
          orderNumber: String(d.orderNumber || 'BC-000'),
          supplier: String(d.supplier || 'Fournisseur inconnu'),
          createdAt: String(d.createdAt || new Date().toISOString()),
          status: (d.status as PurchaseOrder['status']) || 'brouillon',
          items: Array.isArray(d.items) ? (d.items as OrderItem[]) : [],
          totalAmount: Number(d.totalAmount) || 0,
          notes: d.notes ? String(d.notes) : '',
          receivedAt: d.receivedAt ? String(d.receivedAt) : undefined
        });
      });
      if (orders.length > 0) {
        onSuccess(orders);
        saveOrdersToLocalStorage(orders);
      }
    },
    error => {
      console.warn('Mode hors-ligne / Erreur écoute commandes Firestore:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    }
  );
}

/**
 * Saves or updates a purchase order in Firestore and localStorage.
 */
export async function saveOrderToFirestore(order: PurchaseOrder): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(
      orderRef,
      {
        id: order.id,
        orderNumber: order.orderNumber,
        supplier: order.supplier,
        createdAt: order.createdAt,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        notes: order.notes || '',
        receivedAt: order.receivedAt || '',
        updatedAt: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'local'
      },
      { merge: true }
    );
  } catch (err) {
    if (err instanceof Error && (err.message.includes('offline') || err.message.includes('unavailable'))) {
      console.warn('Mode hors-ligne: commande sauvegardée en local.');
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Deletes an order from Firestore.
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Atomically marks an order as received, increments product stocks in the database,
 * and creates corresponding audit movements in the movements journal.
 */
export async function receiveOrderInFirestore(
  order: PurchaseOrder,
  productsMap: Map<number, Product>
): Promise<{ updatedProducts: Product[]; newMovements: StockMovement[] }> {
  const now = new Date().toISOString();
  const updatedProducts: Product[] = [];
  const newMovements: StockMovement[] = [];

  for (const item of order.items) {
    const existingProd = productsMap.get(item.productId);
    if (!existingProd) continue;

    const newQty = (existingProd.quantite || 0) + item.quantiteCommandee;
    const updatedProd: Product = {
      ...existingProd,
      quantite: newQty
    };
    updatedProducts.push(updatedProd);

    const mvt: StockMovement = {
      id: `mvt_rcv_${order.id}_${item.productId}_${Date.now()}`,
      date: now,
      type: 'entree',
      productId: item.productId,
      productName: item.designation,
      quantite: item.quantiteCommandee,
      stockApres: newQty,
      note: `Livraison commande ${order.orderNumber} (${order.supplier})`
    };
    newMovements.push(mvt);
  }

  // Attempt Firestore batch commit if user is online & authenticated
  try {
    if (auth.currentUser && (!navigator || navigator.onLine)) {
      const batch = writeBatch(db);

      // 1. Update order status
      const orderRef = doc(db, ORDERS_COLLECTION, order.id);
      batch.update(orderRef, {
        status: 'receptionnee',
        receivedAt: now,
        updatedAt: now
      });

      // 2. Update all product quantities
      for (const prod of updatedProducts) {
        const prodRef = doc(db, PRODUCTS_COLLECTION, prod.id.toString());
        batch.update(prodRef, {
          quantite: prod.quantite,
          updatedAt: now
        });
      }

      // 3. Insert stock movements
      for (const mvt of newMovements) {
        const mvtRef = doc(db, MOVEMENTS_COLLECTION, mvt.id);
        batch.set(mvtRef, {
          id: mvt.id,
          date: mvt.date,
          type: mvt.type,
          productId: mvt.productId,
          productName: mvt.productName,
          quantite: mvt.quantite,
          stockApres: mvt.stockApres,
          note: mvt.note || '',
          userId: auth.currentUser?.uid || 'pharmacien'
        });
      }

      await batch.commit();
    }
  } catch (err) {
    console.warn('Avertissement synchronisation réception Firestore:', err);
  }

  return { updatedProducts, newMovements };
}
