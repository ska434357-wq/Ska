import { Product } from '../data/initialProducts';

/**
 * Computes standard CIP-13 / EAN-13 barcode format for a pharmacy product
 * Format: 340093 + 4 digits of product number + 1 check digit
 */
export function getProductBarcode(productNo: number): string {
  const base = `340093${String(productNo).padStart(6, '0')}`;
  // Calculate EAN-13 modulo 10 check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base}${checkDigit}`;
}

/**
 * Resolves a scanned barcode or douchette input to a pharmacy product.
 * Handles:
 * - Direct product numbers (e.g., "1", "#1", "001")
 * - Official CIP-13 / EAN-13 barcodes (e.g., "3400930000017")
 * - Any EAN barcode where the suffix contains the product number
 * - QR codes or DataMatrix containing "#no" or product ID
 * - Fallback match on designation
 */
export function findProductByBarcode(scannedCode: string, products: Product[]): Product | null {
  if (!scannedCode) return null;
  const raw = scannedCode.trim();

  // 1. Check exact match on generated CIP-13
  const byCip = products.find(p => getProductBarcode(p.no) === raw);
  if (byCip) return byCip;

  // 2. Check numeric match on product number: "42", "#42", "no 42"
  const cleanNum = raw.replace(/[^0-9]/g, '');
  if (cleanNum) {
    const num = parseInt(cleanNum, 10);
    // Direct product number match (1 to 302)
    const byNo = products.find(p => p.no === num || p.id === num);
    if (byNo) return byNo;

    // Check if barcode ends with product number (last 1-4 digits before check digit)
    if (raw.length >= 8) {
      const sub = parseInt(raw.slice(-4, -1), 10);
      const bySub = products.find(p => p.no === sub);
      if (bySub) return bySub;
    }
  }

  // 3. Check designation match (case-insensitive)
  const lower = raw.toLowerCase();
  const byName = products.find(p => p.designation.toLowerCase() === lower);
  if (byName) return byName;

  const byPartial = products.find(p => p.designation.toLowerCase().includes(lower));
  if (byPartial) return byPartial;

  return null;
}
