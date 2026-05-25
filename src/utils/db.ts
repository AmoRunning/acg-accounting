import type { Category, GuRecord, TrashRecord, FieldConfig } from '../types';

const DB_NAME = 'ChiguDB';
const DB_VERSION = 3;
const STORE_RECORDS = 'records';
const STORE_TRASH = 'trash';
const STORE_CATEGORIES = 'categories';
const STORE_FIELD_CONFIGS = 'fieldConfigs';

let db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onupgradeneeded = (e) => {
      const d = (e.target as IDBOpenDBRequest).result;
      if (!d.objectStoreNames.contains(STORE_RECORDS)) {
        const store = d.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('status', 'status');
      }
      if (!d.objectStoreNames.contains(STORE_TRASH)) {
        d.createObjectStore(STORE_TRASH, { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains(STORE_CATEGORIES)) {
        d.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains(STORE_FIELD_CONFIGS)) {
        d.createObjectStore(STORE_FIELD_CONFIGS, { keyPath: 'id' });
      }
    };
  });
}

function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
  const tx = db!.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

export function getAllRecords(): Promise<GuRecord[]> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_RECORDS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function putRecord(record: GuRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_RECORDS, 'readwrite');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function deleteRecord(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_RECORDS, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function getAllTrash(): Promise<TrashRecord[]> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_TRASH);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function putTrash(item: TrashRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_TRASH, 'readwrite');
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function deleteTrash(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_TRASH, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function clearTrash(): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_TRASH, 'readwrite');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveAllRecords(records: GuRecord[]): Promise<void> {
  const tx = db!.transaction(STORE_RECORDS, 'readwrite');
  const store = tx.objectStore(STORE_RECORDS);
  await new Promise<void>((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve();
    clearReq.onerror = () => reject(clearReq.error);
  });
  for (const rec of records) {
    store.put(rec);
  }
}

export async function saveAllTrash(trashItems: TrashRecord[]): Promise<void> {
  const tx = db!.transaction(STORE_TRASH, 'readwrite');
  const store = tx.objectStore(STORE_TRASH);
  await new Promise<void>((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve();
    clearReq.onerror = () => reject(clearReq.error);
  });
  for (const item of trashItems) {
    store.put(item);
  }
}

export function getAllCategories(): Promise<Category[]> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_CATEGORIES);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function putCategory(category: Category): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_CATEGORIES, 'readwrite');
    const req = store.put(category);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function deleteCategory(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_CATEGORIES, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_zhangzi', name: '章子', isDefault: true },
  { id: 'cat_zhipian', name: '纸片', isDefault: true },
  { id: 'cat_yakeli', name: '亚克力', isDefault: true },
];

export function getAllFieldConfigs(): Promise<FieldConfig[]> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FIELD_CONFIGS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function putFieldConfig(config: FieldConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FIELD_CONFIGS, 'readwrite');
    const req = store.put(config);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function deleteFieldConfig(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FIELD_CONFIGS, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function getDefaultFieldConfigsForCategory(categoryId: string): FieldConfig[] {
  if (categoryId === 'cat_zhangzi') {
    return [
      { id: `field_craft_${categoryId}`, name: '工艺', key: 'craft', widget: 'select', options: ['烤漆', 'ffl', '烤漆盖玻璃', '烤漆+ffl'], isDefault: true, categoryId },
      { id: `field_plating_${categoryId}`, name: '镀色', key: 'plating', widget: 'input', options: [], isDefault: true, categoryId },
    ];
  }
  return [];
}
