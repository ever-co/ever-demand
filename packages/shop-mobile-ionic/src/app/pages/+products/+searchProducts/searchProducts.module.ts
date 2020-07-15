import { NgModule } from '@angular/core';
import { SearchProductsComponent } from './searchProducts.component';

import { GeoLocationService } from 'app/services/geo-location';
import { MerchantsService } from 'app/services/merchants/merchants.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule],
	declarations: [SearchProductsComponent],
	exports: [SearchProductsComponent],
	providers: [GeoLocationService, MerchantsService],
})
export class SearchProductsModule {}
