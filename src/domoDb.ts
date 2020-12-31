import { AppDb } from "./appDb";
import { ConstructorOf, IAppDbBulkRes, IAppDbDoc, IDomoDb, IDomoDoc } from "./models";

/**
 * @deprecated
 */
interface IAppDbService<D, T> {
    FetchAll: () => Promise<T[]>;
    FetchDoc: (documentId: string) => Promise<T>;
    Query: (query: any) => Promise<T[]>;
    Create: (content: T) => Promise<T>;
    Update: (content: T) => Promise<void>;
    Delete: (content: T) => Promise<void>;
    Upsert: (content: T) => Promise<T>;
}

/**
 * opinionated implementation of AppDb helper utility. For an unopinionated helper see the AppDb class
 * which this uses internally.
 * @deprecated
 */
export class DomoAppDb<D extends IDomoDoc, T extends IDomoDb<D>> implements IAppDbService<D, T> {

    public collectionName: string;
    private collectionClass: ConstructorOf<D, T>;
    constructor(collectionClass: ConstructorOf<D, T>) {
        this.collectionClass = collectionClass;
        this.collectionName = new collectionClass().collectionName;
    }

    /**
     * retrieve all documents in the AppDb collection
     */
    public async FetchAll() {
        return AppDb.FetchAll<D>(this.collectionName)
            .then((appDocArr) => {
                const docs = appDocArr.map((doc) => new this.collectionClass(doc));
                return docs;
            });
    }

    /**
     * retrieve an individual record from the AppDb collection
     * @param documentId id of the document to retreive from the AppDb collection
     */
    public async FetchDoc(documentId: string) {
        return AppDb.FetchDoc<D>(this.collectionName, documentId)
            .then((appDoc) => {
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
        const docContent = content.GetAppDbFormat?.() ?? content;
        delete (docContent as any).collectionName; // No need to store collectionName in the appDb document
        return AppDb.Create(this.collectionName, docContent as D)
            .then((appDbDoc) => {
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
        const docContent = content.GetAppDbFormat?.() ?? content;
        delete (docContent as any).collectionName; // No need to store collectionName in the appDb document
        return AppDb.Update(this.collectionName, content.id, docContent)
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
        return AppDb.Delete(this.collectionName, docId)
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

        const docsToUpsert = docs.map((d) => d.GetAppDbFormat?.() ?? d);
        docsToUpsert.forEach((d) => {
            if ((d as any).collectionName) {
                delete (d as any).collectionName;
            }
        });
        return AppDb.BulkUpsert(this.collectionName, docsToUpsert);
    }

    /**
     * Bulk delete a set of documents from the AppDb collection
     * @param recordsToDelete list of documents/documentIds to delete from AppDb collection
     */
    public async BulkDelete(recordsToDelete: Array<T | string>): Promise<IAppDbBulkRes> {
        const recordIds: string[] = [];
        recordsToDelete.forEach((item) => {
            // if it's a string append it otherwise get id from type D
            if (typeof item === "string") { recordIds.push(item); } else {
                const id = item.GetAppDbFormat?.().id ?? item.id;
                if (id) {
                    recordIds.push(id);
                }
            }
        });
        return AppDb.BulkDelete(this.collectionName, recordIds);
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Query%20Documents)
     * @param query query parameters for search
     */
    public async Query(query: any): Promise<T[]> {
        return AppDb.Query<D>(this.collectionName, query)
            .then(async (queryResults) => {
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
        return AppDb.QueryAggregation(this.collectionName, query, aggregationParams)
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Partially%20Update%20Documents%20Using%20Queries)
     * @param query query for documents to update.
     * @param operation operation to perform on found documents.
     */
    public async UpdateWhere(query: any, operation: any) {

        return AppDb.UpdateWhere(this.collectionName, query, operation)
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
