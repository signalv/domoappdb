import { AppDbCollectionLevelSecurity } from "./collectionLevelSecurity";
import { IQueryAggregationParams } from "./domoDb";
import { jsonDateReviver } from "./jsonDateParsing";
import { IAppDbBulkRes, IAppDbCollection, IAppDbCollectionSchema, IAppDbDoc, ManualExportStatus } from "./models";

/**
 * Simple wrapper for the Domo AppDb APIs
 */
export class AppDb {

    public static domoUrl: string = "/domo/datastores/v1/collections";

    /**
     * utility for interacting with Collection Level Security APIs
     */
    public static get CollectionSecurity() {
        return AppDbCollectionLevelSecurity;
    }

    /**
     * retrieve all documents in the AppDb collection
     * @param collectionName AppDb collection to perform action on
     */
    public static async FetchAll<T>(collectionName: string, useJsonDateReviver?: boolean) {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents`, options)
            .then(response => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.text()
            })
            .then(async (responseText) => {
                const reviver = useJsonDateReviver ? jsonDateReviver : undefined;
                const body = responseText;
                    const appDocArr: Array<IAppDbDoc<T>> = JSON.parse(body, reviver);
                    return appDocArr;
            });
    }

    /**
     * retrieve an individual record from the AppDb collection
     * @param collectionName AppDb collection to perform action on
     * @param documentId id of the document to retreive from the AppDb collection
     */
    public static async FetchDoc<T>(collectionName: string, documentId: string, useJsonDateReviver?: boolean) {
        const options = {
            // headers,
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${documentId}`, options)
            .then(response => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.text()
            })
            .then(async (responseText) => {
                const reviver = useJsonDateReviver ? jsonDateReviver : undefined;
                    const body = responseText;
                    const appDoc: IAppDbDoc<T> = JSON.parse(body, reviver);
                    return appDoc;
            });
    }

    /**
     * Create a new document in the AppDb Collection and return the resulting value.
     * @param collectionName AppDb collection to create document in.
     * @param content value to store as a new document in the AppDb collection.
     */
    public static async Create<T>(collectionName: string, content: T, useJsonDateReviver?: boolean) {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify({ content }), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/`, options)
            .then(response => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.text()
            })
            .then(async (responseTxt) => {
                const reviver = useJsonDateReviver ? jsonDateReviver : undefined;
                    const body = responseTxt
                    const appDbDoc: IAppDbDoc<T> = JSON.parse(body, reviver);
                    return appDbDoc;
            });
    }

    /**
     * Update the content of an existing AppDb collection document.
     * @param collectionName AppDb collection document to update is located.
     * @param docId documentId to update the content for in AppDb
     * @param content existing documents local state to update the document in the AppDb collection to.
     */
    public static async Update<T>(collectionName: string, docId: string, content: T) {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify({ content }), // Domo needs the form { content: object }
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${docId}`, options)
            .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return;
            });
    }

    /**
     * delete an existing document from the AppDb collection.
     * @param collectionName AppDb collection that the document to delete exists in.
     * @param docId documentId of existing doc to delete.
     */
    public static async Delete(collectionName: string, docId: string) {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/${docId}`, options)
            .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    console.error('Domo AppDb API Network response was not ok', response.json())
                    throw new Error('Domo AppDb API Network response was not ok')
                }
                return;
            });
    }

    public static async Upsert<T>(content: T): Promise<IAppDbDoc<T>> {
        throw new Error("not yet implemented");
    }

    /**
     * Creates or updates documents in AppDb collection.
     * @param collectionName AppDb collection to perform action on
     * @param docs array of documents to create/update
     */
    public static async BulkUpsert<T>(collectionName: string, docs: T[]): Promise<IAppDbBulkRes> {

        const headers = new Headers({ "Content-Type": "application/json" });
        const docsToUpsert = docs.map((d) => ({ content: d }));
        const options = {
            body: JSON.stringify(docsToUpsert), // Domo needs the form { content: object }[]
            headers,
            method: "PUT",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/bulk`, options)
            .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.json();
        });
    }

    /**
     * Bulk delete a set of documents from the AppDb collection
     * @param collectionName AppDb collection to perform action on
     * @param recordIds list of documents/documentIds to delete from AppDb collection
     */
    public static async BulkDelete(collectionName: string, recordIds: string[]): Promise<IAppDbBulkRes> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/bulk?ids=${recordIds.join()}`, options)
            .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.json();
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Query%20Documents)
     * @param collectionName AppDb collection to perform action on
     * @param query query parameters for search
     */
    public static async Query<T>(collectionName: string, query: any, useJsonDateReviver?: boolean) {
        const dbQuery = query;
        const headers = new Headers({ "Content-Type": "application/json", "Accept": "application/json" });
        const options = {
            body: JSON.stringify(dbQuery), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${this.domoUrl}/${collectionName}/documents/query`, options)
            .then(response => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.text()
            })
            .then(async (response) => {
                const reviver = useJsonDateReviver ? jsonDateReviver : undefined;
                    const body = response
                    const queryResults: Array<IAppDbDoc<T>> = JSON.parse(body, reviver);
                    return queryResults;
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Query%20Documents%20with%20Aggregations)
     * @param collectionName AppDb collection to perform action on
     * @param query query parameters for search
     * @param aggregationParams aggregation params for query
     */
    public static async QueryAggregation(collectionName: string, query: any, aggregationParams: IQueryAggregationParams, useJsonDateReviver?: boolean) {
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
        return fetch(`${this.domoUrl}/${collectionName}/documents/query${aggQueryStr ? "?" + aggQueryStr : ""}`,
                        options)
            .then(async (response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                if (useJsonDateReviver) {
                    const body = await response.text();
                    return JSON.parse(body, jsonDateReviver) as unknown as object[];
                } else {
                    return response.json() as unknown as object[];
                }
            });
    }

    /**
     * see [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb#Partially%20Update%20Documents%20Using%20Queries)
     * @param collectionName AppDb collection to perform action on
     * @param query query for documents to update.
     * @param operation operation to perform on found documents.
     */
    public static async UpdateWhere(collectionName: string, query: any, operation: any) {

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
        return fetch(`${this.domoUrl}/${collectionName}/documents/update`, options)
            .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.json();
            });
    }

    /**
     * Get an array of all collections for the current Datastore (Domo App/Card instance)
     */
    public static async FetchCollections(): Promise<IAppDbCollection[]> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
        };
        return fetch(`${this.domoUrl}/`, options)
            .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return response.json();
            });
    }

    /**
     * programmatically create an AppDb Collection in the current Datastore.
     * @param collection AppDb Collection to create.
     */
    public static async CreateCollection(collection: IAppDbCollectionSchema): Promise<IAppDbCollection> {
            const headers = new Headers({ "Content-Type": "application/json" });
            const options = {
                body: JSON.stringify(collection),
                headers,
                method: "POST",
            };
            return fetch(`${this.domoUrl}/`, options)
                .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                    return response.json();
                });
    }

    /**
     * Update properties of an existing AppDb Collection in the current Datastore
     * @param collectionName name of the collection to update
     * @param propsToUpdate properties to update on collection. values not being updated can be omitted
     */
    public static async UpdateCollection(collectionName: string, propsToUpdate: IAppDbCollectionSchema): Promise<IAppDbCollection> {
            const headers = new Headers({ "Content-Type": "application/json" });
            const options = {
                body: JSON.stringify(propsToUpdate), // Domo needs the form { content: document }
                headers,
                method: "PUT",
            };
            return fetch(`${this.domoUrl}/${collectionName}`, options)
                .then((response) => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                    return response.json();
                });
    }

    /**
     * Delete an AppDb Collection from the current Datastore
     * @param collectionName collection to delete
     */
    public static async DeleteCollection(collectionName: string): Promise<void> {
            const headers = new Headers({ "Content-Type": "application/json" });
            const options = {
                headers,
                method: "DELETE",
            };
        return fetch(`${this.domoUrl}/${collectionName}`, options)
            .then(response => {
                // A fetch promise will reject when a network error is encountered, but a 404 does not constitute a network error
                if (!response.ok) {
                    throw new Error('Domo AppDb API Response was not Ok')
                }
                return;
            })
    }

    /**
     * Manually trigger a sync between collections marked `syncEnabled` in the current Datastore
     * and the Domo Datacenter.
     * Normally collections sync to the Domo Datacenter every 15min if there's been a change to them
     * or their document(s) since the last time it synced.
     */
    public static async ManuallyStartAppDbToDatacenterSync(): Promise<ManualExportStatus> {
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
}
