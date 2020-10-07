
export type AppDbPermission = "admin" | "write" | "read" | "share" | "delete" | "create_content" | "update_content" | "read_content" | "delete_content";
const domoUrl = "/domo/datastores/v1/collections";

export async function ModifyCollectionPermissions(
    collectionName: string,
    level: "USER" | "GROUP" | "RYUU_APP", entityId: string,
    permissions: AppDbPermission[]) {
        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "PUT",
        };
        const uri = `${domoUrl}/${collectionName}/permission/${level}/${entityId}?permissions=${permissions.join()}`;
        return fetch(uri, options);
}

export async function DeleteCollectionPermissions(
    collectionName: string, level: "USER" | "GROUP" | "RYUU_APP", entityId: string) {

        const headers = new Headers({ "Content-Type": "application/json" });
        const options = {
            headers,
            method: "DELETE",
        };
        const uri = `${domoUrl}/${collectionName}/permission/${level}/${entityId}`;
        return fetch(uri, options);
}
