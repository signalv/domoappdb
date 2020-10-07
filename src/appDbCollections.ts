import { IAppDbCollection, IAppDbCollectionSchema, ManualExportStatus } from "./models";

const domoUrl = "/domo/datastores/v1/collections";
export async function CreateCollection(collection: IAppDbCollectionSchema): Promise<IAppDbCollection> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(collection), // Domo needs the form { content: document }
            headers,
            method: "POST",
        };
        return fetch(`${domoUrl}/`, options)
            .then((response) => {
                return response.json();
            });
    }

export async function UpdateCollection(collection: IAppDbCollectionSchema): Promise<IAppDbCollection> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            body: JSON.stringify(collection), // Domo needs the form { content: document }
            headers,
            method: "PUT",
        };
        return fetch(`${domoUrl}/${collection.name}`, options)
            .then((response) => {
                return response.json();
            });
}

export async function DeleteCollection(collectionName: string): Promise<void> {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        return fetch(`${domoUrl}/${collectionName}`, options).then(() => { return; });
}

export async function ManuallyStartAppDbToDatacenterSync(): Promise<ManualExportStatus> {
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
