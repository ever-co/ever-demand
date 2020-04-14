import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgProgressModule } from '@ngx-progressbar/core';
import { IonicModule } from '@ionic/angular';
import { ProductDetailsPage } from './product-details.page';
import { WarehouseLogoModule } from '../../../components/warehouse-logo/warehouse-logo.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { OrderPageModule } from '../+order/order.module';
import { CancelPageModule } from '../+order/+cancel/cancel.module';
import { ProductsModule } from '../../../components/products/products.module';
import { OrderTakeawayInfoPopupModule } from '../+order/takeaway/popup/popup.module';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [
	{
		path: '',
		component: ProductDetailsPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		WarehouseLogoModule,
		NgProgressModule.withConfig({}),
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		RouterModule.forChild(routes),
		OrderPageModule,
		CancelPageModule,
		ProductsModule,
		OrderTakeawayInfoPopupModule,
	],
	providers: [],
	declarations: [ProductDetailsPage],
})
export class ProductDetailsPageModule {}
