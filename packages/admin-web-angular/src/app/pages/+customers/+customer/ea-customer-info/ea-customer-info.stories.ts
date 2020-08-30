var user = {
	_id: '5cc0925e8979b91ee93c86a1',
	firstName: 'Maxwell',
	lastName: 'Mante',
	image: 'https://s3.amazonaws.com/uifaces/faces/twitter/jm_denis/128.jpg',
	email: 'Mason.Kutch33@hotmail.com',
	apartment: '138',
	phone: '1-566-610-8055 x749',
	geoLocation: {
		streetAddress: '139 Lebsack Parks',
		city: 'Angelineland',
		house: '150',
		loc: {
			type: 'Point',
			coordinates: [23.3332736, 42.6459136],
			__typename: 'Loc',
		},
		__typename: 'GeoLocation',
	},
	__typename: 'User',
};

import { storiesOf, moduleMetadata } from '@storybook/angular';

import { withKnobs, object } from '@storybook/addon-knobs';
import { ThemeModule } from '@app/@theme';
import { CommonModule, APP_BASE_HREF } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbSpinnerModule } from '@nebular/theme';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { ToasterModule } from 'angular2-toaster';
import {
	TranslateModule,
	TranslateStore,
	TranslateService,
} from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NbAuthModule } from '@nebular/auth';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgSelectModule } from '@ng-select/ng-select';
import { I18nModule } from '@app/@core/utils/i18n.module';
import { CustomerInfoComponent } from './ea-customer-info.component';
import { HighlightModule } from 'ngx-highlightjs';
import { RenderComponentsModule } from '@app/@shared/render-component/render-components.module';
import { WarehouseMutationModule } from '@app/@shared/warehouse/warehouse-mutation';
import { CustomerOrdersTableModule } from '@app/@shared/render-component/customer-orders-table/customer-orders-table.module';
import { CustomerProductsTableModule } from '@app/@shared/render-component/customer-products-table/customer-products-table.module';
import { CustomerWarehousesTableModule } from '@app/@shared/warehouse/customer-warehouses-table/customer-warehouses-table.module';
import { WarehouseOrderModalModule } from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.module';
import { CustomerOrdersModule } from '../ea-customer-orders/ea-customer-orders.module';
import { FormsModule } from '@angular/forms';
import { CustomerComponent } from '../customer.component';
import { CustomerLocationComponent } from '../ea-customer-location/ea-customer-location.component';
import { CustomerProductsComponent } from '../ea-customer-products/ea-customer-products/ea-customer-products.component';
import { CustomerStoresComponent } from '../ea-customer-stores/ea-customer-stores.component';
import { CustomerMetricsComponent } from '../ea-customer-metrics/ea-customer-metrics.component';
import { UsersService } from '@app/@core/data/users.service';

const stories = storiesOf('Customer Info', module);

export function createApollo(httpLink: HttpLink) {
	return {
		link: httpLink.create({ uri: 'https://api.example.com/graphql' }),
		cache: new InMemoryCache(),
	};
}

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, '/i18n/', '.json');
}

stories.addDecorator(withKnobs);
stories.addDecorator(
	moduleMetadata({
		declarations: [
			CustomerComponent,
			CustomerLocationComponent,
			CustomerInfoComponent,
			CustomerProductsComponent,
			CustomerStoresComponent,
			CustomerMetricsComponent,
		],
		imports: [
			NgSelectModule,
			CommonModule,
			ThemeModule,
			Ng2SmartTableModule,
			NbSpinnerModule,
			ConfirmationModalModule,
			ToasterModule.forRoot(),
			HttpClientModule,
			I18nModule,
			NbAuthModule,
			ApolloModule,
			PipesModule,
			CommonModule,
			Ng2SmartTableModule,
			ThemeModule,
			ToasterModule.forRoot(),
			RouterModule.forRoot([]),
			TranslateModule.forChild(),
			HighlightModule.forRoot({ theme: 'github' }),
			RenderComponentsModule,
			WarehouseMutationModule,
			CustomerOrdersTableModule,
			CustomerProductsTableModule,
			CustomerWarehousesTableModule,
			WarehouseOrderModalModule,
			CustomerOrdersModule,
			NgSelectModule,
			FormsModule,
		],
		providers: [
			{
				provide: APOLLO_OPTIONS,
				useFactory: createApollo,
				deps: [HttpLink],
			},
			TranslateStore,
			NotifyService,
			TranslateService,
			HttpLink,
			UsersService,
			{ provide: APP_BASE_HREF, useValue: '/' },
		],
	})
);

stories.add('Customer Info', () => ({
	component: CustomerInfoComponent,
	props: {
		user: object('User', user),
	},
}));
