import { AppDb } from "./appDb";
import { IAppDbBulkRes } from "./models";

export interface IAppDbContent {
    domoAppDbDocId: string | null;
}

/**
 * opinionated implementation of AppDb helper utility. For an unopinionated helper see the AppDb class
 * which this uses internally.
 */
export class SvDomoAppDb<T> {

    /** AppDb Collection Name to use when interacting with AppDb API */
    public collectionName: string;
    /** Whether or not to deserialize date strings into Date objects when parsing json from Domo */
    public ParseDateStringsIntoDate: boolean = true;
    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    /**
     * retrieve all documents in the AppDb collection
     */
    public async FetchAll() {
        return AppDb.FetchAll<T>(this.collectionName, this.ParseDateStringsIntoDate)
            .then((appDocArr) => {
                const docs = appDocArr.map((doc) => ({ ...doc.content, domoAppDbDocId: doc.id }));
                return docs;
            });
    }

    /**
     * retrieve an individual record from the AppDb collection
     * @param documentId id of the document to retreive from the AppDb collection
     */
    public async FetchDoc(documentId: string) {
        return AppDb.FetchDoc<T>(this.collectionName, documentId, this.ParseDateStringsIntoDate)
            .then((appDoc) => {
                const doc = { ...appDoc.content, domoAppDbDocId: appDoc.id };
                return doc;
            });
    }

    /**
     * Create a new document in the AppDb Collection and return the resulting value.
     * @param content value to store as a new document in the AppDb collection.
     */
    public async Create(content: T) {
        return AppDb.Create(this.collectionName, content, this.ParseDateStringsIntoDate)
            .then((appDbDoc) => {
                const newDoc = { ...appDbDoc.content, domoAppDbDocId: appDbDoc.id };
                return newDoc;
            });
    }

    /**
     * Update the content of an existing AppDb collection document.
     * @param content existing documents local state to update the document in the AppDb collection to.
     * If content.domoAppDbDocId is null or undefined it will throw an error.
     */
    public async Update(content: T & IAppDbContent) {
        if (content.domoAppDbDocId === undefined || content.domoAppDbDocId === null) {
            throw new Error("missing documentId");
        }
        return AppDb.Update(this.collectionName, content.domoAppDbDocId, content)
    }

    /**
     * delete an existing document from the AppDb collection.
     * @param recordToDelete existing document to delete or existing document's AppDb documentId.
     */
    public async Delete(recordToDelete: (T & IAppDbContent) | string) {
        let docId: string;
        if (typeof recordToDelete === "string") {
            docId = recordToDelete as string;
        } else {
            if (recordToDelete.domoAppDbDocId === undefined || recordToDelete.domoAppDbDocId === null) {
                throw new Error("missing documentId");
            }
            docId = recordToDelete.domoAppDbDocId!;
        }
        return AppDb.Delete(this.collectionName, docId)
    }

    public async Upsert(content: T): Promise<T> {
        throw new Error("not yet implemented");
    }

    /**
     * Creates or updates documents in AppDb collection.
     * @param docs array of documents to create/update
     */
    public async BulkUpsert(docs: T[]): Promise<IAppDbBulkRes> {

        const docsToUpsert = docs;

        return AppDb.BulkUpsert(this.collectionName, docsToUpsert);
    }

    /**
     * Bulk delete a set of documents from the AppDb collection
     * @param recordsToDelete list of documents/documentIds to delete from AppDb collection
     */
    public async BulkDelete(recordsToDelete: Array<T & IAppDbContent | string>): Promise<IAppDbBulkRes> {
        const recordIds: string[] = [];
        recordsToDelete.forEach((item) => {
            // if it's a string append it otherwise get id from type D
            if (typeof item === "string") {
                recordIds.push(item as string);
            } else {
                const id = item.domoAppDbDocId;
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
        return AppDb.Query<T>(this.collectionName, query, this.ParseDateStringsIntoDate)
            .then(async (queryResults) => {
                const docsFound = queryResults.map((doc) => ({ ...doc.content, domoAppDbDocId: doc.id }));
                return docsFound;
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Query%20Documents%20with%20Aggregations)
     * @param query query parameters for search
     * @param aggregationParams aggregation params for query
     */
    public async QueryAggregation(query: any, aggregationParams: IQueryAggregationParams): Promise<object[]> {
        return AppDb.QueryAggregation(this.collectionName, query, aggregationParams, this.ParseDateStringsIntoDate);
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
