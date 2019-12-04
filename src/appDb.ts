import { AppDbBulkRes, AppDbCollection, AppDbCollectionSchema, AppDbDoc, IDomoDb, ManualExportStatus } from "./models";

class DomoDataService {
    private static instance: DomoDataService;
    public domoUrl: string;
    public static get Instance() {
        return this.instance || (this.instance = new this());
    }
    constructor() {
        // this.damUrl = "https://buildintelligencedataservices.azurewebsites.net/api";
        this.domoUrl = "/domo/datastores/v1/collections";
    }
    public async GetAllDocuments<T>(collectionName: string): Promise<Array<AppDbDoc<T>>> {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async GetDocument<T>(collectionName: string, documentId: string): Promise<AppDbDoc<T>> {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${documentId}`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async CreateDocuments(collectionName: string, documents: any[]): Promise<AppDbBulkRes> {
        //  Domo expects the body to be [{content: documentObject }]
        const docs: object[] = documents.map((document) => ({ content: document }));
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(docs),
            headers,
            method: "POST",
        };
        const res = await fetch(`${this.domoUrl}/${collectionName}/documents/bulk`, options);
        const body: AppDbBulkRes = await res.json();
        // Domo returns the number of documents successfully created i.e. {"Created":2}
        return body;
    }
    public async CreateDocument<T>(collectionName: string, document: T): Promise<AppDbDoc<T>> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify({ content: document }), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async CreateAppDbDocument<U, T extends IDomoDb<U> & U>(doc: T): Promise<AppDbDoc<U>> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify({ content: doc.GetAppDbFormat() }), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${doc.collectionName}/documents/`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async UpdateAppDbDocument<U, T extends IDomoDb<U> & U>(doc: T): Promise<AppDbDoc<U>> {
        if (doc.id === undefined) {
            throw new Error("missing documentId");
        }
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify({ content: doc.GetAppDbFormat() }), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${doc.collectionName}/documents/${doc.id}`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async UpdateDocument<T>(collectionName: string, recordId: string, document: T): Promise<AppDbDoc<T>> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify({ content: document }), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${recordId}`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async UpsertDocuments<T>(collectionName: string, documents: Array<AppDbDoc<T>>): Promise<AppDbBulkRes> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(documents), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/bulk`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async DeleteDocument(collectionName: string, recordId: string): Promise<boolean> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${recordId}`, options)
            .then((response) => {
                return response.ok;
            });
    }
    public async DeleteDocuments(collectionName: string, recordIds: string[]): Promise<AppDbBulkRes> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/bulk?ids=${recordIds.join()}`, options)
            .then((response) => {
                return response.json();
            });
    }

    // Manually run a sync between AppDb Collections that are sync enabled and the Domo Datacenter.
    public async ManuallyExportSyncEnabledCollectionsToDatacenter(): Promise<ManualExportStatus> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`/domo/datastores/v1/export`, options)
            .then((response) => {
                switch (response.status) {
                    case 423:
                        // HTTP 423 LOCKED -> export already in progress
                        return ManualExportStatus.ALREADY_IN_PROGRESS;
                    case 200:
                        // export request successful/started.
                        return ManualExportStatus.STARTED;
                    default:
                        // Error!
                        throw new Error(response.statusText);
                }
            });
    }
    public async CreateCollection(collection: AppDbCollectionSchema): Promise<AppDbCollection> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(collection), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async UpdateCollection(collection: AppDbCollectionSchema): Promise<AppDbCollection> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(collection), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${collection.name}`, options)
            .then((response) => {
                return response.json();
            });
    }
}

export const domoDataService = DomoDataService.Instance;
