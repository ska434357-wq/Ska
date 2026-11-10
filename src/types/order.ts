export type OrderStatus = 'brouillon' | 'envoyee' | 'receptionnee' | 'annulee';

export interface OrderItem {
  productId: number;
  productNo: number;
  designation: string;
  quantiteCommandee: number;
  prixUnitaire: number;
  totalLigne: number;
  stockActuel?: number;
  seuilAlerte?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  receivedAt?: string;
}
