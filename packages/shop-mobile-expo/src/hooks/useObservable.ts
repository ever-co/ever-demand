import { useEffect, useState } from 'react';
import type { Observable } from 'rxjs';

/**
 * Subscribes to the observable `factory` returns while the component is mounted (and again when
 * `deps` change). Returns the latest value and the last error.
 */
export function useObservable<T>(
	factory: () => Observable<T> | null | undefined,
	deps: ReadonlyArray<unknown>,
): { value: T | undefined; error: unknown } {
	const [state, setState] = useState<{ value: T | undefined; error: unknown }>({
		value: undefined,
		error: undefined,
	});

	useEffect(() => {
		const observable = factory();
		if (!observable) {
			setState({ value: undefined, error: undefined });
			return undefined;
		}
		const subscription = observable.subscribe({
			next: (value) => setState({ value, error: undefined }),
			error: (error) => setState((prev) => ({ value: prev.value, error })),
		});
		return () => subscription.unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return state;
}
