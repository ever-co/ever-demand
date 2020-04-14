import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonLibModule } from './lib';
import { RoutersModule } from './routers';
import { API_URL } from './lib/router';
import { LocaleModule } from './locale/locale.module';

interface CommonModuleConfig {
	apiUrl: string;
}

@NgModule({
	imports: [CommonLibModule, RoutersModule, LocaleModule],
})
export class CommonModule {
	static forRoot(options: CommonModuleConfig): ModuleWithProviders {
		return {
			ngModule: CommonModule,
			providers: [{ provide: API_URL, useValue: options.apiUrl }],
		};
	}
}
