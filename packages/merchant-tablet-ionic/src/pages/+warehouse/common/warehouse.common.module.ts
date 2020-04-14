import { NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from '../../../../src/app/app.module';
import { NoOrdersInfoComponent } from './no-orders-info/no-orders-info.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

const COMPONENTS = [NoOrdersInfoComponent];

@NgModule({
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [],
	imports: [
		CommonModule,
		IonicModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
	],
})
export class WarehouseCommonModule {}
