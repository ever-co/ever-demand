import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductsComponent } from './products.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { routes } from './products.routes';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ProductDetailsComponent } from './product-details';
import { WarehouseLogoModule } from '../warehouse-logo';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GeoLocationService } from 'app/services/geo-location';
import { GeoLocationProductsService } from 'app/services/geo-location-products';
import { WarehouseProductsService } from 'app/services/warehouse-products';
import { ProductsCommonModule } from './common/common.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { CarouselViewModule } from './views/carousel/carousel-view.module';
import { ListViewModule } from './views/list/list-view.module';
import { FormsModule } from '@angular/forms';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	declarations: [ProductsComponent, ProductDetailsComponent],
	imports: [
		CommonModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		RouterModule.forChild(routes),
		LazyLoadImageModule,
		WarehouseLogoModule,
		MatCardModule,
		ProductsCommonModule,
		MatIconModule,
		DragScrollModule,
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
