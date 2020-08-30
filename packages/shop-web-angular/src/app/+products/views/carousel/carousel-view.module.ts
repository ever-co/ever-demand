import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselViewComponent } from './carousel-view.component';
import { MatCardModule } from '@angular/material/card';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { FormsModule } from '@angular/forms';
import { GeoLocationProductsService } from 'app/services/geo-location-products';
import { GeoLocationService } from 'app/services/geo-location';
import { ProductModule } from 'app/+products/product/product.module';
import { ViewTypeModule } from 'app/view-type/view-type.modeule';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		FormsModule,
		MatCardModule,
		NgxHmCarouselModule,
		ProductModule,
		ViewTypeModule,
	],
	declarations: [CarouselViewComponent],
	exports: [CarouselViewComponent],
	providers: [GeoLocationProductsService, GeoLocationService],
})
export class CarouselViewModule {}
