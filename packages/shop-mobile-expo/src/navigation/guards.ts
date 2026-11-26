/**
 * Route guards of the Ionic app (feature inventory §3.2) as pure functions of the session.
 * "Logged in" means a stored user id; the app checks it against the server once at start
 * (`verifyUser`), which is when the Ionic lazy-module guards ran too.
 */
import { DeliveryType, RegistrationSystem } from '../domain/enums';
import type { SessionState } from '../store/session';
import type { RouteName } from './types';

/** Pages that are always reachable (no `PagesModuleGuard`). */
const UNGUARDED: ReadonlyArray<RouteName> = ['ServerDown', 'ConnectionLost', 'Maintenance', 'Language'];

/** `''` → `invite` → `invite/by-code` with the invite guards applied. */
export function inviteEntry(session: SessionState): RouteName {
	if (session.userId != null || session.registrationSystem === RegistrationSystem.Disabled) {
		return 'Products';
	}
	return session.inviteSystem ? 'InviteByCode' : 'InviteByLocation';
}

/** Where the app starts: maintenance, server down, or the invite entry. */
export function initialRoute(session: SessionState): RouteName {
	if (session.maintenanceMode) {
		return 'Maintenance';
	}
	if (session.serverConnection === 0) {
		return 'ServerDown';
	}
	return inviteEntry(session);
}

/** The route to go to instead of `route`, or null when `route` may open. */
export function guardRoute(route: RouteName, session: SessionState): RouteName | null {
	if (route === 'Maintenance') {
		return session.maintenanceMode ? null : initialRoute(session);
	}

	if (!UNGUARDED.includes(route)) {
		if (session.maintenanceMode) {
			return 'Maintenance';
		}
		if (session.serverConnection === 0) {
			return 'ServerDown';
		}
	}

	const logged = session.userId != null;
	const registrationRequired = session.registrationSystem === RegistrationSystem.Enabled;
	const redirect = (target: RouteName) => (target === route ? null : target);

	switch (route) {
		case 'InviteByCode':
		case 'InviteByLocation': {
			if (logged || session.registrationSystem === RegistrationSystem.Disabled) {
				return 'Products';
			}
			if (route === 'InviteByCode' && !session.inviteSystem) {
				return 'InviteByLocation';
			}
			if (route === 'InviteByLocation' && session.inviteRequestId != null && session.inviteSystem) {
				return 'InviteByCode';
			}
			return null;
		}
		case 'Products':
		case 'Merchants':
		case 'About':
		case 'Help':
		case 'Privacy':
		case 'TermsOfUse':
			return !logged && registrationRequired ? redirect(inviteEntry(session)) : null;
		case 'OrdersHistory':
		case 'OrderDetails':
			return logged ? null : redirect(inviteEntry(session));
		case 'OrderInfo':
			if (!logged) {
				return inviteEntry(session);
			}
			return session.deliveryType === DeliveryType.Takeaway ? 'OrderTakeawayInfo' : null;
		case 'OrderTakeawayInfo':
			if (!logged) {
				return inviteEntry(session);
			}
			return session.deliveryType === DeliveryType.Delivery ? 'OrderInfo' : null;
		default:
			return null;
	}
}

