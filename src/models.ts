enum AppDbDataType {
    STRING = "STRING",
    LONG = "LONG",
    DOUBLE = "DOUBLE",
    DECIMAL = "DECIMAL",
    DATE = "DATE", // YYYY-MM-DD
    DATETIME = "DATETIME", // YYYY-MM-DDTHH:MM:SSZ

}
export interface ICollectionSchema {
    columns: IDomoSchema[];
}
export interface IDomoSchema {
    name: string;
    type: AppDbDataType;
    visible?: boolean;
}
export interface IAppDbCollectionSchema {
    name: string;
    schema: ICollectionSchema;
    syncEnabled: boolean;
}
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
export interface IAppDbBulkRes {
    Created?: number;
    Updated?: number;
    Deleted?: number;
}
export interface IDomoDb<T> {
    id?: string;
    collectionName: string;
    GetAppDbFormat(): T;
}

// based on HTTP Response examples from https://developer.domo.com/docs/dev-studio-references/appdb-storage
export interface IAppDbDoc<T> {
    id?: string;
    customer?: string;
    owner?: number;
    datastoreId?: string;
    collectionId?: string;
    createdOn?: string; // Date; // "2019-03-04T16:59:25.184+0000"
    updatedOn?: string; // Date; // "2019-03-04T16:59:25.184+0000"
    updatedBy?: number;
    content?: T;
    syncRequired?: boolean;
}

export interface ISVIndexDB {
    collectionName: string;
    idbId?: number | string;
    id?: string;
}
