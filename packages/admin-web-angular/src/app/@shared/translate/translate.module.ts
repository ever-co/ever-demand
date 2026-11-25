import { NgModule } from '@angular/core';
import { TranslateModule as NgxTranslateModule } from '@modules/client.common.angular2/locale/translate.module';

/**
 * The `translate` pipe and directive for feature modules. The root `TranslateService` (and its
 * HTTP loader for `./assets/i18n/*.json`) comes from `TranslateModule.forRoot(...)` in AppModule,
 * so every screen shares the selected language.
 */
@NgModule({
	imports: [NgxTranslateModule],
	exports: [NgxTranslateModule],
})
export class TranslateModule {}
