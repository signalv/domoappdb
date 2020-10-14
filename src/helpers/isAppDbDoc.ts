import { IAppDbDoc } from "../models";

/**
 * Type Guard for narrowing between IAppDbDoc<T> and T.
 * Useful for a ts class constructor that can take IAppDbDoc<T> | T
 * so it can be initialized from a Domo AppDb document or another instance of T
 * @param val value to narrow to IAppDbDoc<T> and T
 */
export function isAppDbDoc<T>(val: IAppDbDoc<T> | T): val is IAppDbDoc<T> {
    const v = val as IAppDbDoc<T>;
    return v.content !== undefined
        && v.owner !== undefined
        && v.collectionId !== undefined
        && v.datastoreId !== undefined;
}
