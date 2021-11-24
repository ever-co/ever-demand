import { Resolver, Query } from '@nestjs/graphql';
import { AppsSettingsService } from '../../services/apps-settings';
import { IAdminAppSettings } from '@modules/server.common/interfaces/IAppsSettings';

@Resolver('AppsSettings')
export class AdminResolver {
	constructor(private readonly _appsSettingsService: AppsSettingsService) {}

	@Query('adminAppSettings')
	async getAdminAppSettings(_): Promise<IAdminAppSettings> {
		return this._appsSettingsService.getAdminAppSettings();
	}
}
