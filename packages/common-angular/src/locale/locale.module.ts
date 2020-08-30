import { NgModule } from '@angular/core';
import { ProductLocalesService } from './product-locales.service';
import {
	TranslateService,
	TranslateModule,
	TranslateLoader,
	TranslateFakeLoader,
} from '@ngx-translate/core';

@NgModule({
	imports: [
		TranslateModule.forRoot({
			loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
		}),
	],
	providers: [ProductLocalesService, TranslateService],
})
export class LocaleModule {}
