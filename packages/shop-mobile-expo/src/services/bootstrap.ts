/**
 * App start (feature inventory §3.1): server check, maintenance check, server settings, user check
 * and device registration, in the Ionic APP_INITIALIZER order.
 */
import { firstValueFrom } from 'rxjs';
import { Platform } from 'react-native';
import { RegistrationSystem } from '../domain/enums';
import type { AppStore } from '../store';
import { sessionActions } from '../store/session';
import { randomId } from '../utils/uuid';
import type { Services } from './container';
import { withTimeout } from './location';

/** How long a start-up RPC may take before the app goes on without it. */
const RPC_TIMEOUT_MS = 10000;

export interface MaintenanceInfo {
	type: string;
	status: boolean;
	message: string;
}

/**
 * HTTP status of `GET SERVICES_ENDPOINT`: `0` when unreachable. On the web the request is
 * `no-cors`, so only reachability counts (an opaque answer means the server is up).
 */
export async function checkServer(services: Pick<Services, 'env' | 'fetch'>): Promise<number> {
	try {
		const response = await withTimeout(
			services.fetch(services.env.SERVICES_ENDPOINT, Platform.OS === 'web' ? { mode: 'no-cors' } : undefined),
			10000,
		);
		return response.type === 'opaque' ? 200 : response.status || 200;
	} catch {
		return 0;
	}
}

export async function fetchMaintenanceInfo(
	services: Pick<Services, 'env' | 'fetch'>,
): Promise<MaintenanceInfo[] | null> {
	const url = services.env.SETTINGS_MAINTENANCE_API_URL;
	if (!url) {
		return null;
	}
	try {
		const response = await withTimeout(
			services.fetch(url, { headers: { 'Content-Type': 'application/json' } }),
			10000,
		);
		const body = (await response.json()) as { maintenance?: MaintenanceInfo[] };
		return body.maintenance ?? [];
	} catch {
		return null;
	}
}

/** `MaintenanceService.load`: the `api` entry or this app's entry when its status is on. */
export function maintenanceModeOf(info: MaintenanceInfo[] | null, appType: string): string | null {
	if (!info) {
		return null;
	}
	const entry =
		info.find((m) => m.type === 'api' && m.status) || info.find((m) => m.type === appType && m.status);
	return entry ? entry.type : null;
}

/** `MaintenanceService.getStatus`: true while both the api and the app entries are on. */
export function maintenanceStatusOf(info: MaintenanceInfo[] | null, appType: string): boolean {
	if (!info) {
		return false;
	}
	const api = info.find((m) => m.type === 'api');
	const app = info.find((m) => m.type === appType);
	return !!api?.status && !!app?.status;
}

export async function loadServerSettings(services: Services, store: AppStore): Promise<void> {
	try {
		const [inviteSettings, registrationSettings] = await withTimeout(
			Promise.all([
				services.routers.invite.getInvitesSettings(),
				services.routers.userAuth.getRegistrationsSettings(),
			]),
			RPC_TIMEOUT_MS,
		);
		store.dispatch(
			sessionActions.setServerSettings({
				inviteSystem: !!inviteSettings?.isEnabled,
				registrationSystem: registrationSettings?.registrationRequiredOnStart
					? RegistrationSystem.Enabled
					: RegistrationSystem.Disabled,
			}),
		);
	} catch (error) {
		console.warn('Could not load the server settings', error);
	}
}

/**
 * `Store.isLogged()`: a stored user that the server no longer knows is forgotten. A timeout keeps
 * the user (the server may only be slow), an error or a null user clears it.
 */
export async function verifyUser(services: Services, store: AppStore): Promise<boolean> {
	const { userId } = store.getState().session;
	if (!userId) {
		return false;
	}
	try {
		const user = await withTimeout(firstValueFrom(services.routers.user.get(userId)), RPC_TIMEOUT_MS, 'timeout');
		if (user) {
			return true;
		}
	} catch (error) {
		if ((error as Error)?.message === 'timeout') {
			return true;
		}
	}
	console.warn(`User with id '${userId}' does not exist!`);
	store.dispatch(sessionActions.setUserId(null));
	return false;
}

/** Registers this device once (`_deviceId`). */
export async function registerDevice(services: Services, store: AppStore): Promise<void> {
	const session = store.getState().session;
	if (session.deviceId) {
		return;
	}
	const uuid = session.deviceUuid || services.env.FAKE_UUID || randomId();
	try {
		const device = await withTimeout(
			services.routers.device.create({
				channelId: null,
				language: session.language || 'en-US',
				type: services.platform,
				uuid,
			}),
			RPC_TIMEOUT_MS,
		);
		if (device?.id) {
			store.dispatch(sessionActions.setDevice({ deviceId: device.id, deviceUuid: uuid }));
		}
	} catch (error) {
		console.warn('Could not register the device', error);
	}
}

export async function bootstrap(services: Services, store: AppStore): Promise<void> {
	const serverConnection = await checkServer(services);
	store.dispatch(sessionActions.setServerConnection(serverConnection));

	const maintenance = maintenanceModeOf(await fetchMaintenanceInfo(services), services.env.SETTINGS_APP_TYPE);
	store.dispatch(sessionActions.setMaintenanceMode(maintenance));

	if (!maintenance && serverConnection !== 0) {
		await loadServerSettings(services, store);
		await verifyUser(services, store);
		await registerDevice(services, store);
	}
}
