const DB_NAME = "diaryDB";
const STORE = "entries";

export function uid() {
  return (
    crypto?.randomUUID?.() ||
    `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
}

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

/** ✅ 엔트리 저장 (Blob 포함) */
export async function saveEntry(entry) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/** ✅ 엔트리 전체 불러오기 */
export async function loadEntries() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const arr = req.result || [];
      arr.sort((a, b) => b.createdAt - a.createdAt);

      // Blob → URL 변환
      arr.forEach((e) => {
        if (e.mainPhotoBlob) {
          e.mainPhotoUrl = URL.createObjectURL(e.mainPhotoBlob);
        }
        if (e.photoBlobs) {
          e.photoUrls = e.photoBlobs.map((blob) =>
            URL.createObjectURL(blob)
          );
        }
      });

      res(arr);
    };
    req.onerror = () => rej(req.error);
  });
}

/** ✅ 특정 엔트리 불러오기 */
export async function getEntry(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const e = req.result || null;
      if (e) {
        if (e.mainPhotoBlob) {
          e.mainPhotoUrl = URL.createObjectURL(e.mainPhotoBlob);
        }
        if (e.photoBlobs) {
          e.photoUrls = e.photoBlobs.map((blob) =>
            URL.createObjectURL(blob)
          );
        }
      }
      res(e);
    };
    req.onerror = () => rej(req.error);
  });
}

/** ✅ 엔트리 삭제 */
export async function deleteEntry(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}