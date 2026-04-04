import { useState, useEffect, useCallback } from 'react';
export function useIndexedDB(dbName: string, storeName: string) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  useEffect(() => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore(storeName, { keyPath: 'id' }); };
    request.onsuccess = () => setDb(request.result);
    return () => { db?.close(); };
  }, [dbName, storeName]);
  const get = useCallback(async (id: string) => { if (!db) return null; return new Promise((resolve) => { const tx = db.transaction(storeName, 'readonly'); const store = tx.objectStore(storeName); const req = store.get(id); req.onsuccess = () => resolve(req.result); }); }, [db, storeName]);
  const set = useCallback(async (data: unknown) => { if (!db) return; const tx = db.transaction(storeName, 'readwrite'); tx.objectStore(storeName).put(data); }, [db, storeName]);
  const remove = useCallback(async (id: string) => { if (!db) return; const tx = db.transaction(storeName, 'readwrite'); tx.objectStore(storeName).delete(id); }, [db, storeName]);
  return { get, set, remove, isReady: !!db };
}
