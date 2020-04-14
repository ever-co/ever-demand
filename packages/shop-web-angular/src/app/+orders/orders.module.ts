import { NgModule } from '@angular/core';
import { OrdersComponent } from './orders.component';
import { OrdersContainerComponent } from './orders.container.component';
import { routes } from './orders.routes';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderComponent } from './order';
import { WarehouseLogoModule } from '../warehouse-logo';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessagePopUpComponent } from 'app/shared/message-pop-up/message-pop-up.component';
import { MessagePopUpModalModule } from 'app/shared/message-pop-up/message-pop-up.module';
import { CarrierLocationComponent } from './location/carrier-location.component';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	declarations: [
		OrdersContainerComponent,
		OrdersComponent,
		OrderComponent,
		CarrierLocationComponent,
		// MessagePopUpComponent
	],
	entryComponents: [CarrierLocationComponent],
	imports: [
		CommonModule,
		MessagePopUpModalModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		FormsModule,
		RouterModule.forChild(routes),

		MatDialogModule,
		MatButtonModule,
		MatCardModule,

		WarehouseLogoModule,
	],
})
export class OrdersModule {}
