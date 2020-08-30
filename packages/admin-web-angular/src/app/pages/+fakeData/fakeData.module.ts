import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';
import { RouterModule } from '@angular/router';
import { routes } from './fakeData.routes';
import { FakeDataComponent } from './fakeData.component';
import FakeDataInvites from '../../@core/data/fakeDataServices/invites';
import FakeDataCarriers from '../../@core/data/fakeDataServices/carriers';
import FakeDataProducts from '../../@core/data/fakeDataServices/products';
import FakeDataWarehouses from '../../@core/data/fakeDataServices/warehouses';
import FakeDataWarehousesProducts from '../../@core/data/fakeDataServices/warehousesProducts';
import FakeDataUsers from '../../@core/data/fakeDataServices/users';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToasterModule } from 'angular2-toaster';
import FakeDataProductsCategories from '../../@core/data/fakeDataServices/productsCategories';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { InvitesService } from '@app/@core/data/invites.service';
import { InvitesRequestsService } from '@app/@core/data/invites-requests.service';
import { UsersService } from '@app/@core/data/users.service';
import { CurrenciesService } from '@app/@core/data/currencies.service';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		RouterModule.forChild(routes),
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [FakeDataComponent],
	providers: [
		FakeDataInvites,
		FakeDataCarriers,
		FakeDataProducts,
		FakeDataWarehouses,
		FakeDataWarehousesProducts,
		FakeDataUsers,
		FakeDataProductsCategories,
		InvitesService,
		InvitesRequestsService,
		UsersService,
		NotifyService,
		CurrenciesService,
	],
})
export class FakeDataModule {
	public static routes = routes;

	constructor() {
		console.log('`FakeData` module initialized');
	}
}
