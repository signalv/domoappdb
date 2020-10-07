import { ConstructorOf, IAppDbBulkRes, IAppDbDoc, IDomoDb, IDomoDoc } from "./models";

interface IAppDbService<D, T> {
    FetchAll: () => Promise<T[]>;
    FetchDoc: (documentId: string) => Promise<T>;
    Query: (query: any) => Promise<T[]>;
    Create: (content: T) => Promise<T>;
    Update: (content: T) => Promise<void>;
    Delete: (content: T) => Promise<void>;
    Upsert: (content: T) => Promise<T>;
}
export class DomoAppDb<D extends IDomoDoc, T extends IDomoDb<D>> implements IAppDbService<D, T> {

    public collectionName: string;
    public domoUrl: string = "/domo/datastores/v1/collections";
    private collectionClass: ConstructorOf<D, T>;
    constructor(collectionClass: ConstructorOf<D, T>) {
        this.collectionClass = collectionClass;
        this.collectionName = new collectionClass().collectionName;
    }

    /**
     * retrieve all documents in the AppDb collection
     */
    public async FetchAll() {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents`, options)
            .then(async (response) => {
                const appDocArr: Array<IAppDbDoc<D>> = await response.json();
                const docs = appDocArr.map((doc) => new this.collectionClass(doc));
                return docs;
            });
    }

    /**
     * retrieve an individual record from the AppDb collection
     * @param documentId id of the document to retreive from the AppDb collection
     */
    public async FetchDoc(documentId: string) {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/${documentId}`, options)
            .then(async (response) => {
                const appDoc: IAppDbDoc<D> = await response.json();
                const doc =  new this.collectionClass(appDoc);
                return doc;
            });
    }

    /**
     * Create a new document in the AppDb Collection and return the resulting value.
     * @param content value to store as a new document in the AppDb collection.
     * If content has a `GetAppDbFormat` method defined that will be used as the value to store,
     * otherwise it'll JSON.stringify this value directly
     */
    public async Create(content: T) {
        const headers = new Headers({ "Content-Type": "application/json" });
        const docContent = content.GetAppDbFormat?.() ?? content;
        delete (docContent as any).collectionName; // No need to store collectionName in the appDb document
        const options = {
            body: JSON.stringify({ content: docContent }), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/`, options)
            .then(async (response) => {
                const appDbDoc = await response.json();
                const newDoc = new this.collectionClass(appDbDoc);
                return newDoc;
            });
    }

    /**
     * Update the content of an existing AppDb collection document.
     * @param content existing documents local state to update the document in the AppDb collection to.
     * If content has a `GetAppDbFormat` method defined that will be used as the value to store,
     * otherwise it'll JSON.stringify this value directly.
     * If content.id is null or undefined it will throw an error.
     */
    public async Update(content: T) {
        if (content.id === undefined || content.id === null) {
            throw new Error("missing documentId");
        }
        const headers = new Headers({ "Content-Type": "application/json" });
        const docContent = content.GetAppDbFormat?.() ?? content;
        delete (docContent as any).collectionName; // No need to store collectionName in the appDb document
        const options = {
            body: JSON.stringify({ content: docContent }), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/${content.id}`, options)
            .then(() => {
                return;
            });
    }

    /**
     * delete an existing document from the AppDb collection.
     * @param recordToDelete existing document to delete or existing document's AppDb documentId.
     */
    public async Delete(recordToDelete: T | string) {
        let docId;
        if (typeof recordToDelete === "string") {
            docId = recordToDelete;
        } else {
            if (recordToDelete.id === undefined || recordToDelete.id === null) {
                throw new Error("missing documentId");
            }
            docId = recordToDelete.id;
        }
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/${docId}`, options)
            .then(() => {
                return;
            });
    }

    public async Upsert(content: T): Promise<T> {
        throw new Error("not yet implemented");
    }

    /**
     * Creates or updates documents in AppDb collection.
     * @param docs array of documents to create/update
     */
    public async BulkUpsert(docs: T[]): Promise<IAppDbBulkRes> {

        const headers = new Headers({ "Content-Type": "application/json" });
        const docsToUpsert = docs.map((d) => d.GetAppDbFormat?.() ?? d);
        docsToUpsert.forEach((d) => {
            if ((d as any).collectionName) {
                delete (d as any).collectionName;
            }
        });
        const options = {
            body: JSON.stringify(docsToUpsert), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/bulk`, options)
            .then((response) => {
                return response.json();
        });
    }

    /**
     * Bulk delete a set of documents from the AppDb collection
     * @param recordsToDelete list of documents/documentIds to delete from AppDb collection
     */
    public async BulkDelete(recordsToDelete: Array<T | string>): Promise<IAppDbBulkRes> {
        const recordIds: string[] = [];
        recordsToDelete.forEach((item) => {
            if (typeof item === "string") { recordIds.push(item); } else {
                const id = item.GetAppDbFormat?.().id ?? item.id;
                if (id) {
                    recordIds.push(id);
                }
            }
        });
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/bulk?ids=${recordIds.join()}`, options)
            .then((response) => {
                return response.json();
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Query%20Documents)
     * @param query query parameters for search
     */
    public async Query(query: any): Promise<T[]> {
        const dbQuery = query;
        const headers = new Headers({ "Content-Type": "application/json", "Accept": "application/json" });
        const options = {
            body: JSON.stringify(dbQuery), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/query`, options)
            .then(async (response) => {
                const queryResults: Array<IAppDbDoc<D>> = await response.json();
                const docsFound = queryResults.map((doc) => new this.collectionClass(doc));
                return docsFound;
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Query%20Documents%20with%20Aggregations)
     * @param query query parameters for search
     * @param aggregationParams aggregation params for query
     */
    public async QueryAggregation(query: any, aggregationParams: IQueryAggregationParams): Promise<object[]> {
        const dbQuery = query;
        let aggQueryStr = "";
        const { groupBy, count, avg, min, max, sum, orderBy, limit, offset } = aggregationParams;
        if (groupBy) { aggQueryStr += "groupBy=" + groupBy; }
        if (count) { aggQueryStr += "count=" + count; }
        if (avg) { aggQueryStr += "avg=" + avg; }
        if (min) { aggQueryStr += "min=" + min; }
        if (max) { aggQueryStr += "max=" + max; }
        if (sum) { aggQueryStr += "sum=" + sum; }
        if (orderBy) { aggQueryStr += "orderBy=" + orderBy; }
        if (limit) { aggQueryStr += "limit=" + limit; }
        if (offset) { aggQueryStr += "offset=" + offset; }

        const headers = new Headers({ "Content-Type": "application/json", "Accept": "application/json" });
        const options = {
            body: JSON.stringify(dbQuery), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/query${aggQueryStr ? "?" + aggQueryStr : ""}`,
                        options)
            .then((response) => {
                return response.json() as unknown as object[];
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Partially%20Update%20Documents%20Using%20Queries)
     * @param query query for documents to update.
     * @param operation operation to perform on found documents.
     */
    public async UpdateWhere(query: any, operation: any) {

        const reqBody = {
            query: JSON.stringify(query),
            // tslint:disable-next-line: object-literal-sort-keys
            operation: JSON.stringify(operation),
        };
        const headers = new Headers({ "Content-Type": "application/json", "Accept": "application/json" });
        const options = {
            body: JSON.stringify(reqBody),
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${this.collectionName}/documents/update`, options)
            .then((response) => {
                return response.json();
            });
    }

}

export interface IQueryAggregationParams {
    groupBy?: string;
    count?: string;
     avg?: string;
    min?: string;
    max?: string;
    sum?: string;
    orderBy?: string;
    limit?: number;
    offset?: number;
}
