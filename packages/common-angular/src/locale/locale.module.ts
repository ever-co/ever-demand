import { NgModule } from '@angular/core';
import { ProductLocalesService } from './product-locales.service';

/**
 * Provides `ProductLocalesService`. The root `TranslateService` comes from the app's own
 * `TranslateModule.forRoot(...)` (see `./translate.module`), so there is exactly one.
 */
@NgModule({
	providers: [ProductLocalesService],
})
export class LocaleModule {}
