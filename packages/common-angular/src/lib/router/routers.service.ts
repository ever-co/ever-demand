import { Observable, combineLatest, of, ReplaySubject } from 'rxjs';
import { map, mergeAll, publishReplay, refCount, scan } from 'rxjs/operators';
import { ConnectionStatus, Socket } from '../socket.service';

export class RoutersService {
	/**
	 * routers would register themselves here
	 * Note: routers can be initialized later so we need observable here
	 *
	 * @type {ReplaySubject<Socket>}
	 * @memberof RoutersService
	 */
	public sockets: ReplaySubject<Socket> = new ReplaySubject<Socket>();

	public isConnectionProblem: Observable<boolean>;

	constructor() {
		/**
		 * Here We get observable of routers, then we map it to observable of connectionStatus observables,
		 * Each time router registered we combineLatest it's isSpecificErrorObs observable with the isAnyErrorObs
		 * observable which initializes with the value of Observable.of(false)
		 * By checking if any of the observables next's true, the result of the combineLatest becomes the new isAnyErrorObs.
		 * At the end we do mergeAll, and forget about the fact there is any dependency on the routers observable by that.
		 * Then comes publishReplay and refCount which makes sure we won't have to run this whole crazy code
		 * each time some one subscribes isConnectionProblem.
		 */
		this.isConnectionProblem = this.sockets.pipe(
			map((socket) => {
				return socket.connectionStatus.pipe(
					map(
						(status) =>
							status === ConnectionStatus.Disconnected ||
							status === ConnectionStatus.ConnectError
					)
				);
			}),
			scan(
				(
					isAnyErrorObs: Observable<boolean>,
					isSpecificErrorObs: Observable<boolean>
				) => {
					return combineLatest(
						isAnyErrorObs,
						isSpecificErrorObs
					).pipe(
						map(
							([isAnyError, isSpecificError]) =>
								isAnyError || isSpecificError
						)
					);
				},
				of(false)
			),
			mergeAll(),
			publishReplay(1),
			refCount()
		);
	}
}
