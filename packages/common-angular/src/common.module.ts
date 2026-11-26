import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonLibModule } from './lib';
import { RoutersModule } from './routers';
import { API_URL } from './lib/router';
import { LocaleModule } from './locale/locale.module';
import { ClientTenantConfig, SOCKET_AUTH, socketAuthFrom } from './lib/tenant';

interface CommonModuleConfig {
	apiUrl: string;
	/** Tenant of the app (build-time id and/or base domain of tenant hosts) */
	tenant?: ClientTenantConfig;
	/** localStorage key of the login token sent in the socket handshake; null = none */
	tokenStorageKey?: string | null;
	/** Send the tenant next to a login token (super-admin tenant switch) */
	tenantWithToken?: boolean;
}

@NgModule({
	imports: [CommonLibModule, RoutersModule, LocaleModule],
})
export class CommonModule {
	static forRoot(options: CommonModuleConfig): ModuleWithProviders<CommonModule> {
		return {
			ngModule: CommonModule,
			providers: [
				{ provide: API_URL, useValue: options.apiUrl },
				{
					provide: SOCKET_AUTH,
					useValue: socketAuthFrom(
						options.tenant ?? {},
						options.tokenStorageKey === undefined ? 'token' : options.tokenStorageKey,
						options.tenantWithToken === true
					),
				},
			],
		};
	}
}
