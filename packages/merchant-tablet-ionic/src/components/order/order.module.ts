import { NgModule } from '@angular/core';
import { ChooseCustomerOptionComponent } from './choose-customer-option.component';
import { MakeOrderComponent } from './make-order/make-order.component';
import { SelectAddCustomerComponent } from './select-add-customer.component';
import { OrderComponent } from './order.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { UsersService } from '../../services/users.service';
import { UserMutationModule } from '../../@shared/user/mutation/user-mutation.module';
import { AddressComponent } from './address.component';
import { MakeOrderInputComponent } from './make-order/make-order-input.component';
import { WarehouseOrdersService } from '../../services/warehouse-orders.service';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		Ng2SmartTableModule,
		IonicModule,
		CommonModule,
		FormsModule,
		UserMutationModule,
		TranslateModule.forChild(),
	],
	declarations: [
		OrderComponent,
		ChooseCustomerOptionComponent,
		SelectAddCustomerComponent,
		MakeOrderComponent,
		MakeOrderInputComponent,
		AddressComponent,
	],
	entryComponents: [AddressComponent, MakeOrderInputComponent],
	exports: [
		OrderComponent,
		ChooseCustomerOptionComponent,
		SelectAddCustomerComponent,
		MakeOrderComponent,
	],
	providers: [UsersService, WarehouseOrdersService],
})
export class OrderModule {}
