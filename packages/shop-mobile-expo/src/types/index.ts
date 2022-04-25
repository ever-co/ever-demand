// This file will contain global types/interfaces
// that will be used in the react app

/**
 * Modify properties type of a ``Type`` or ``Interface``
 *
 * i.e:
 * ```javascript
 * interface OriginalInterface {
 *   a: string;
 *   b: boolean;
 *   c: number;
 * }
 *
 * type ModifiedType  = Modify<OriginalInterface , {
 *   a: number;
 *   b: number;
 * }>
 *
 * // ModifiedType = { a: number; b: number; c: number; }
 * ```
 */
export type ModifyPropertiesTypes<T, R> = Omit<T, keyof R> & R;

// TODO: add more comments
export type MaybeType<T> = T | null;

export interface ScalarsInterface {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	Date: any;
	Any: any;
	Void: any;
}
