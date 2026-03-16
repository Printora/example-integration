/**
 * In-memory merch store for creator dashboard demo.
 * Similar pattern to webhook-store.ts — module-scoped state, lost on restart.
 */

export interface StoredMerchVariant {
  id: string;
  color: string;
  colorCode: string | null;
  size: string;
  price: number;
}

export interface StoredMerch {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  imageUrl: string;
  productName: string;
  category: string;
  active: boolean;
  variants: StoredMerchVariant[];
  stockLimit: number | null;
  stockSold: number;
  stockRemaining: number | null;
  isLimitedEdition: boolean;
  createdAt: string;
  updatedAt: string;
}

// Module-scoped store — persists across requests, resets on server restart
const store: StoredMerch[] = [];

export function getAllMerchByCreator(creatorId: string): StoredMerch[] {
  return store.filter((m) => m.creatorId === creatorId);
}

export function getMerchById(id: string): StoredMerch | undefined {
  return store.find((m) => m.id === id);
}

export function createMerch(merch: StoredMerch): StoredMerch {
  // Prevent duplicates by ID
  const existing = store.find((m) => m.id === merch.id);
  if (existing) return existing;
  store.push(merch);
  return merch;
}

export function updateMerch(id: string, updates: Partial<StoredMerch>): StoredMerch | null {
  const idx = store.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...updates, updatedAt: new Date().toISOString() };
  return store[idx];
}

export function setMerchActive(id: string, active: boolean): StoredMerch | null {
  return updateMerch(id, { active });
}
