import { NgModule } from '@angular/core';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { CustomersPage } from './customers';
import { WarehouseUsersService } from '@modules/client.common.angular2/routers/warehouse-users.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { UserPhoneComponent } from '../../components/users-table/phone';
import { AddressComponent } from '../../components/users-table/address';
import { OrdersComponent } from '../../components/users-table/orders';
import { TotalComponent } from '../../components/users-table/total';
import { EmailComponent } from '../../components/users-table/email';
import { ImageUserComponent } from '../../components/users-table/image';
import { OrdersService } from '../../../src/services/orders.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDeletePopupModule } from 'components/confirm-delete-popup/confirm-delete-popup.module';
import { WarehouseOrdersService } from 'services/warehouse-orders.service';

const routes: Routes = [
	{
		path: '',
		component: CustomersPage,
	},
];

@NgModule({
	declarations: [
		CustomersPage,
		ImageUserComponent,
		AddressComponent,
		OrdersComponent,
		TotalComponent,
		EmailComponent,
	],
	imports: [
		PipesModule,
		ComponentsModule,
		IonicModule,
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		ConfirmDeletePopupModule,
	],
	entryComponents: [
		UserPhoneComponent,
		ImageUserComponent,
		AddressComponent,
		OrdersComponent,
		TotalComponent,
		EmailComponent,
	],
	providers: [WarehouseUsersService, OrdersService, WarehouseOrdersService],
})
export class CustomersPageModule {}
