import { injectable } from 'inversify';
import { env } from '../../env';
import { IAdminAppSettings } from '@modules/server.common/interfaces/IAppsSettings';

@injectable()
export class AppsSettingsService {
	getAdminAppSettings(): IAdminAppSettings {
		return {
			adminPasswordReset: env.ADMIN_PASSWORD_RESET,
			fakeDataGenerator: env.FAKE_DATA_GENERATOR,
		};
	}
}
