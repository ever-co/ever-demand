import { Observer, Subject, Subscription } from 'rxjs';
import { TenantContext } from './tenant-context';

type TenantOf<T> = (value: T) => string | null | undefined;

/**
 * A Subject for live record streams (`DBService.existence`) shared by every
 * tenant's subscribers:
 *
 * - each subscriber only receives values of its own tenant (the tenant of
 *   the context it subscribed in); values without a tenant (global
 *   collections) reach everyone;
 * - its callbacks, and so every operator downstream (re-queries in
 *   `switchMap` / `exhaustMap`, ...), run in the subscriber's tenant context,
 *   not in the context of the request that emitted the value.
 *
 * A subscriber without a tenant receives no tenant-owned value.
 */
export class TenantScopedSubject<T> extends Subject<T> {
	constructor(private readonly tenantOf: TenantOf<T>) {
		super();
	}

	override subscribe(
		observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null
	): Subscription {
		const ctx = TenantContext.capture();

		const observer: Partial<Observer<T>> =
			typeof observerOrNext === 'function'
				? { next: observerOrNext }
				: observerOrNext ?? {};

		return super.subscribe({
			next: (value) => {
				const tenantId = this.tenantOf(value);

				if (tenantId != null && !ctx.system && tenantId !== ctx.tenantId) {
					return;
				}

				TenantContext.run(ctx, () => observer.next?.(value));
			},
			error: (err) => TenantContext.run(ctx, () => observer.error?.(err)),
			complete: () => TenantContext.run(ctx, () => observer.complete?.()),
		});
	}
}

/** Tenant of an existence event: of its new value, else of its last one. */
export function existenceEventTenantId(event: {
	value?: any;
	lastValue?: any;
}): string | undefined {
	const tenantId = event?.value?.tenantId ?? event?.lastValue?.tenantId;
	return tenantId == null ? undefined : String(tenantId);
}
