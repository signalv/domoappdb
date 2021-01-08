
/**
 * All AppDb Collection Level Permissions
 */
export type AppDbCollectionPermission = "admin" | "write" | "read" | "share" | "delete" | "create_content" | "update_content" | "read_content" | "delete_content";

/**
 * Simple wrapper around Collection Level Security APIs.
 */
export class AppDbCollectionLevelSecurity {
    public static domoUrl = "/domo/datastores/v1/collections";
    /**
     * Modify Collection Level Permissions for a collection in the current Datastore
     * @param collectionName collection to modify permissions
     * @param level what type of entity is being affected
     * @param entityId id of the entity being targeted. e.g. userId, groupId, or Ryuu App proxy Id.
     * @param permissions permissions to set for targeted level
     */
    public static async ModifyCollectionPermissions(
        collectionName: string,
        level: "USER" | "GROUP" | "RYUU_APP", entityId: string,
        permissions: AppDbCollectionPermission[]) {
            const headers = new Headers({ "Content-Type": "application/json" });
            const options = {
                headers,
                method: "PUT",
            };
            const uri = `${this.domoUrl}/${collectionName}/permission/${level}/${entityId}?permissions=${permissions.join()}`;
            return fetch(uri, options);
    }

    /**
     * Delete permissions for a given target level on a collection in the current Datastore
     * @param collectionName collection to delete permissions on
     * @param level target/level to delete any set permissions
     * @param entityId the id of the target/level to delete permissions from. i.e. userId, groupId, Ryuu App proxy Id.
     */
    public static async DeleteCollectionPermissions(
        collectionName: string, level: "USER" | "GROUP" | "RYUU_APP", entityId: string) {

            const headers = new Headers({ "Content-Type": "application/json" });
            const options = {
                headers,
                method: "DELETE",
            };
            const uri = `${this.domoUrl}/${collectionName}/permission/${level}/${entityId}`;
            return fetch(uri, options);
    }
}
