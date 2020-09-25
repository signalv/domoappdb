import { IAppDbBulkRes, IAppDbCollection, IAppDbCollectionSchema, IAppDbDoc, IDomoDb, ManualExportStatus } from "./models";

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
    public async GetAllDocuments<T>(collectionName: string): Promise<Array<IAppDbDoc<T>>> {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async GetDocument<T>(collectionName: string, documentId: string): Promise<IAppDbDoc<T>> {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${documentId}`, options)
            .then((response) => {
                return response.json();
            });
    }
    public async GetAppDbDocument<T>(doc: IDomoDb<T>): Promise<IAppDbDoc<T>> {
        const options = {
            // headers,
        };
        // TODO: check for/handle no id case.
        return fetch(`${this.domoUrl}/${doc.collectionName}/documents/${doc.id}`, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 404) {
                    throw new Error("not found");
                } else {
                    throw new Error("Domo Request Failed");
                }
            });
    }
    public async CreateAppDbDocuments<T>(collectionName: string, documents: Array<IDomoDb<T>>): Promise<IAppDbBulkRes> {
        //  Domo expects the body to be [{content: documentObject }]
        const docs: object[] = documents.map((document) => ({ content: document.GetAppDbFormat() }));
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(docs),
            headers,
            method: "POST",
        };
        const res = await fetch(`${this.domoUrl}/${collectionName}/documents/bulk`, options);
        const body: IAppDbBulkRes = await res.json();
        // Domo returns the number of documents successfully created i.e. {"Created":2}
        return body;
    }
    public async CreateAppDbDocument<U, T extends IDomoDb<U> & U>(doc: T): Promise<IAppDbDoc<U>> {
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
    public async UpdateAppDbDocument<U, T extends IDomoDb<U> & U>(doc: T): Promise<IAppDbDoc<U>> {
        if (doc.id === undefined || doc.id === null) {
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
    public async UpsertDocuments<T>(collectionName: string, documents: Array<IAppDbDoc<T>>): Promise<IAppDbBulkRes> {
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
    public async DeleteDocuments(collectionName: string, recordIds: string[]): Promise<IAppDbBulkRes> {
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

    /**
     * Manually run a sync between AppDb Collections that are sync enabled and the Domo Datacenter.
     */
    public async ManuallyExportSyncEnabledCollectionsToDatacenter(): Promise<ManualExportStatus> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "POST",
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
    public async CreateCollection(collection: IAppDbCollectionSchema): Promise<IAppDbCollection> {
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
    public async UpdateCollection(collection: IAppDbCollectionSchema): Promise<IAppDbCollection> {
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
