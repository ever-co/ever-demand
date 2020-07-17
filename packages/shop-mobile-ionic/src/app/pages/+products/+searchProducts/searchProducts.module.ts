import { NgModule } from '@angular/core';
import { SearchProductsComponent } from './searchProducts.component';

import { GeoLocationService } from 'app/services/geo-location';
import { MerchantsService } from 'app/services/merchants/merchants.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { WarehouseLogoModule } from '../../../components/warehouse-logo/warehouse-logo.module';
import { ProductsModule } from '../../../components/products/products.module';
import { LoadingModule } from '../../../components/loading/loading.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		WarehouseLogoModule,
		ProductsModule,
		TranslateModule.forChild(),
		LoadingModule,
	],
	declarations: [SearchProductsComponent],
	exports: [SearchProductsComponent],
	providers: [GeoLocationService, MerchantsService],
})
export class SearchProductsModule {}
