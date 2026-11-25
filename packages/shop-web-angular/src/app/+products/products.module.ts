import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductsComponent } from './products.component';
import { routes } from './products.routes';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ProductDetailsComponent } from './product-details';
import { WarehouseLogoModule } from '../warehouse-logo';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GeoLocationService } from 'app/services/geo-location';
import { GeoLocationProductsService } from 'app/services/geo-location-products';
import { WarehouseProductsService } from 'app/services/warehouse-products';
import { ProductsCommonModule } from './common/common.module';
import { CarouselViewModule } from './views/carousel/carousel-view.module';
import { ListViewModule } from './views/list/list-view.module';
import { FormsModule } from '@angular/forms';


@NgModule({
	declarations: [ProductsComponent, ProductDetailsComponent],
	imports: [
		CommonModule,
		TranslateModule,
		RouterModule.forChild(routes),
		WarehouseLogoModule,
		MatCardModule,
		ProductsCommonModule,
		MatIconModule,
		CarouselViewModule,
		ListViewModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
	],
	providers: [
		GeoLocationService,
		GeoLocationProductsService,
		WarehouseProductsService,
	],
})
export class ProductsModule {
	public static routes = routes;
}
