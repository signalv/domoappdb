import { ISVIndexDB } from "./models";

const DB_NAME = "CustomDomoAppDb";
const DB_VERSION = 1;
let DB: IDBDatabase;

export const IDB = {
    async getDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {

            if (DB) { return resolve(DB); }
            console.log("OPENING DB", DB);
            const request: IDBOpenDBRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (e) => {
                console.error("Error opening db", e);
                reject("Error");
            };

            request.onsuccess = (e) => {
                DB = (e.target as IDBRequest<IDBDatabase>).result;
                resolve(DB);
            };

            request.onupgradeneeded = (e) => {
                console.log("onupgradeneeded");
                const db = (e.target! as IDBOpenDBRequest).result;
                const names = db.objectStoreNames;
                for (const name of names) {
                    db.deleteObjectStore(name);
                }
                db.createObjectStore("digitalAssets", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("digitalAssetCategories", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("digitalAssetSubcategories", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("categoryFields", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("subcategoryFields", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("digitalAssetDetails", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("assetFieldEntries", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("fieldSelectOptions", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("svTags", { autoIncrement: true, keyPath: "idbId" });
                db.createObjectStore("digitalAssetTags", { autoIncrement: true, keyPath: "idbId" });
            };
        });
    },
    async saveIdb(doc: ISVIndexDB): Promise<number> {
        const db = await this.getDb();

        return new Promise((resolve) => {
            const trans: IDBTransaction = db.transaction([doc.collectionName], "readwrite");
            trans.oncomplete = () => {
                // console.debug("saveIdb result", idbKey.result);
                resolve(idbKey.result as number);
            };

            const store: IDBObjectStore = trans.objectStore(doc.collectionName);
            const idbKey = store.put(doc);
        });
    },
    async getIdbDocs<T extends ISVIndexDB>(collectionName: string): Promise<T[]> {
        const db = await this.getDb();

        return new Promise((resolve) => {

            const trans = db.transaction([collectionName], "readonly");
            trans.oncomplete = () => {
                resolve(assets);
            };

            const store: IDBObjectStore = trans.objectStore(collectionName);
            const assets: T[] = [];

            const req = store.openCursor();
            req.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>)!.result;
                // const cursor = req.result!;
                if (cursor) {
                    assets.push(cursor.value);
                    cursor.continue();
                }
            };
        });
    },
    async deleteIdbDoc<T extends ISVIndexDB>(doc: T) {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            if (doc.idbId === undefined) {
                reject("Error: No idbId");
            } else {
                const trans = db.transaction([doc.collectionName], "readwrite");
                trans.oncomplete = () => {
                    resolve();
                };

                const store = trans.objectStore(doc.collectionName);
                store.delete(doc.idbId);
            }
        });
    },
};
