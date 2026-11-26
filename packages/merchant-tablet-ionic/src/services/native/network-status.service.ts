import { inject, Injectable, NgZone } from '@angular/core';
import type { ConnectionStatus } from '@capacitor/network';
import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { NETWORK } from './plugins';

/**
 * Connection changes through `@capacitor/network` (replaces `@ionic-native/network`).
 * Events are re-entered into the Angular zone, because native plugin callbacks run outside it.
 */
@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
	private readonly network = inject(NETWORK);
	private readonly zone = inject(NgZone);

	private readonly changes$ = new Observable<ConnectionStatus>((subscriber) => {
		const handle = this.network.addListener('networkStatusChange', (status) =>
			this.zone.run(() => subscriber.next(status))
		);
		return () => {
			handle.then((h) => h.remove()).catch(() => undefined);
		};
	}).pipe(share());

	getStatus(): Promise<ConnectionStatus> {
		return this.network.getStatus();
	}

	onDisconnect(): Observable<void> {
		return this.changes$.pipe(
			filter((status) => !status.connected),
			map(() => undefined)
		);
	}

	onConnect(): Observable<void> {
		return this.changes$.pipe(
			filter((status) => status.connected),
			map(() => undefined)
		);
	}
}
