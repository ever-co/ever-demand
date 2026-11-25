import type { ObservableQuery } from '@apollo/client';
import type { OperatorFunction } from 'rxjs';

/**
 * Apollo Client 4 types a watched query's `data` as possibly partial (`DeepPartial<T>`, see
 * `dataState`). The admin never asks for partial data (`returnPartialData` is off), so this
 * narrows the type back to complete data for the services that map `res.data.x` straight away.
 *
 * Type-only: it does not filter, delay or change any emission.
 */
export function completeData<TData>(): OperatorFunction<
	ObservableQuery.Result<TData>,
	ObservableQuery.Result<TData, 'complete' | 'empty'>
> {
	return (source) => source as any;
}
