import { ModuleWithProviders, NgModule } from '@angular/core';
import {
	ChildTranslateServiceConfig,
	provideChildTranslateService,
	provideTranslateService,
	RootTranslateServiceConfig,
	TranslateDirective,
	TranslatePipe,
} from '@ngx-translate/core';

/**
 * NgModule wrapper for ngx-translate 18+, which removed its own `TranslateModule`.
 *
 * The apps are NgModule based, so they import this instead of `@ngx-translate/core`'s
 * old module:
 * - `TranslateModule.forRoot({ loader, fallbackLang })` provides the root `TranslateService`.
 * - `TranslateModule.forChild()` or plain `TranslateModule` only brings the `translate`
 *   pipe and directive (the root service is shared, as before).
 * - `TranslateModule.forChild(config)` with a config creates an isolated child service.
 */
@NgModule({
	imports: [TranslatePipe, TranslateDirective],
	exports: [TranslatePipe, TranslateDirective],
})
export class TranslateModule {
	static forRoot(
		config: RootTranslateServiceConfig = {}
	): ModuleWithProviders<TranslateModule> {
		return {
			ngModule: TranslateModule,
			providers: provideTranslateService(config),
		};
	}

	static forChild(
		config?: ChildTranslateServiceConfig
	): ModuleWithProviders<TranslateModule> {
		return {
			ngModule: TranslateModule,
			providers: config ? provideChildTranslateService(config) : [],
		};
	}
}
