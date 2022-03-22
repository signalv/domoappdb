/**
 * Metadata about the Domo datastore, collection, etc.
 */
export interface AppDbDomoMetadata {
  customer?: string
  datastoreId?: string
  collectionId?: string
}
/**
 * Metadata for a Domo AppDb document. i.e. owner, createdOn, updatedBy, etc.
 */
export interface AppDbDocMetadata {
  owner: number
  createdOn: string | Date
  updatedOn: string | Date
  updatedBy: number
}

/**
 * Minimum information needed to for an existing document from Domo AppDb.
 */
export interface IAppDbDoc<T> {
  id: string;
  content: T;
}

/**
 * Value that can be upserted into a Domo AppDb collection.
 * i.e. created if there's no id, or updated if there is an id.
 */
export interface UpsertableDoc<T> {
  id?: string
  content: T
}

/**
 * Response format for documents returned from Domo AppDb API.
 * [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb-storage)
 */
export interface AppDbDoc<T> extends AppDbDocMetadata, AppDbDomoMetadata {
  id: string;
  content: T;
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


/** Domo Column Data Types */
enum AppDbDataType {
    STRING = "STRING",
    LONG = "LONG",
    DOUBLE = "DOUBLE",
    DECIMAL = "DECIMAL",
    /** Date YYYY-MM-DD Format */
    DATE = "DATE",
    /** Datetime YYYY-MM-DDTHH:MM:SSZ Format */
    DATETIME = "DATETIME",

}
export interface ICollectionSchema {
    columns: IDomoColumn[];
}
export interface IDomoColumn {
    name: string;
    type: AppDbDataType;
    visible?: boolean;
}
export interface IAppDbCollectionSchema {
    name: string;
    schema: ICollectionSchema;
    syncEnabled: boolean;
}
/** Domo AppDb Collection details */
export interface IAppDbCollection {
    id: string;
    customer: string;
    owner: number;
    datastoreId: string;
    name: string;
    schemaJson: string;
    syncRequired: boolean;
    fullReplaceRequired: boolean;
    lastSync: string; // Date; // "1970-01-02T00:00:00.000+0000"
    updatedBy: number;
    schema: ICollectionSchema;
    createdOn: string; // Date; // "2019-03-04T18:47:12.327+0000"
    updatedOn: string; // Date; // "2019-03-04T18:47:12.327+0000"
    exportable: boolean;
    syncEnabled: boolean;
}
export enum ManualExportStatus {
    ALREADY_IN_PROGRESS,
    STARTED,
}

/** Domo AppDb Responses for bulk operations */
export interface IAppDbBulkRes {
    Created?: number;
    Updated?: number;
    Deleted?: number;
}

export interface DomoErrorResponse {
    status: number;
    statusReason: string;
    toe: string;
}