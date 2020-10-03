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

/** Interface for objects that can be stored in the Domo AppDb where `T` is the type to be stored.
 * @param T is the type to be stored
 */
export interface IDomoDb<T> extends IAppDb {
    /** Domo AppDb Document Id */
    id: string | null;
    /** Collection Name to use for Domo AppDb */
    readonly collectionName: string;
    /** Function to return and object formatted in the way it should be stored in db */
    GetAppDbFormat(): T;
}

export interface IAppDb {
    id: string | null;
    /** Collection Name to use for Domo AppDb */
    readonly collectionName: string;
}

export interface IDomoDbConstructor {
    new(): IAppDb;
}

// function GetData<T extends IDomoDbConstructor>() {
//     const createT = (ctor: IDomoDbConstructor) => {
//         return new ctor();
//     }
//     const temp = createT(TestIf);
//     const cn = temp.collectionName;
// }

// class TestIf implements IDomoDb<TestIf> {
//     id: string | null;
//     collectionName: string = "herro";
//     constructor(val?: TestIf | undefined) {
//         if (val) {
//             this.id = val.id;
//         }
//     }
//     GetAppDbFormat(): TestIf {
//         throw new Error("Method not implemented.");
//     }

// }

/** Response format from AppDb doc query where `T` is the type of content stored.
 * based on HTTP Response examples from
 * [Domo Docs](https://developer.domo.com/docs/dev-studio-references/appdb-storage)
 */
export interface IAppDbDoc<T> {
    /** Domo AppDb Document Id */
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
