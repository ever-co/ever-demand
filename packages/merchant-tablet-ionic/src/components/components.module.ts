import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading';
import { OrderWithoutCarrierComponent } from './order-without-carrier/order-without-carrier';
import { CommonModule } from '@angular/common';
import { OrderControlButtonsComponent } from './order-control-buttons/order-control-buttons';
import { OrderWithCarrierComponent } from './order-with-carrier/order-with-carrier';
import { OrderDeliveredComponent } from './order-delivered/order-delivered';
import { OrderCanceledComponent } from './order-canceled/order-canceled';
import { OrderDeliveryProblemComponent } from './order-delivery-problem/order-delivery-problem';
import { TranslateModule } from '@ngx-translate/core';
import { OrderImageComponent } from './common/order-image/order-image';
import { CommonComponent } from './settings-page-components/common/common';
import { AccountComponent } from './settings-page-components/account/account';
import { LocationComponent } from './settings-page-components/location/location';
import { GoogleMapModule } from '../@shared/google-map/google-map.module';
import { OrderTitleComponent } from './common/order-title/order-title';
import { CustomerInfoComponent } from './common/customer-info/customer-info';
import { CarrierInfoComponent } from './common/carrier-info/carrier-info';
import { PhoneComponent } from './carriers-table/phone';
import { UserPhoneComponent } from './users-table/phone';
import { MomentModule } from 'ngx-moment';
import { OrderWarehousePreparationProblemComponent } from './order-warehouse-preparation-problem/order-warehouse-preparation-problem';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderMapPopupPageModule } from './order-map-popup/order-map-popup.module';
import { CustomerEmailPopupPageModule } from 'pages/+customers/customer-email-popup/customer-email-popup.module';
import { CustomerDeliveriesPopupPageModule } from 'pages/+customers/customer-deliveries-popup/customer-deliveries-popup.module';
import { CustomerAddrPopupPageModule } from 'pages/+customers/customer-addr-popup/customer-addr-popup.module';
import { FileUploaderModule } from './file-uploader/file-uploader.module';

@NgModule({
	declarations: [
		LoadingComponent,
		OrderImageComponent,
		OrderWithoutCarrierComponent,
		OrderControlButtonsComponent,
		OrderWithoutCarrierComponent,
		OrderWithCarrierComponent,
		OrderDeliveredComponent,
		OrderCanceledComponent,
		OrderDeliveryProblemComponent,
		OrderWarehousePreparationProblemComponent,
		CommonComponent,
		AccountComponent,
		LocationComponent,
		OrderTitleComponent,
		CustomerInfoComponent,
		CarrierInfoComponent,
		PhoneComponent,
		UserPhoneComponent,
	],
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		IonicModule,
		FormsModule,
		ReactiveFormsModule,
		GoogleMapModule,
		MomentModule,
		OrderMapPopupPageModule,
		CustomerEmailPopupPageModule,
		CustomerDeliveriesPopupPageModule,
		CustomerAddrPopupPageModule,
		FileUploaderModule,
	],
	exports: [
		LoadingComponent,
		OrderImageComponent,
		OrderWithoutCarrierComponent,
		OrderControlButtonsComponent,
		OrderWithoutCarrierComponent,
		OrderWithCarrierComponent,
		OrderDeliveredComponent,
		OrderCanceledComponent,
		OrderDeliveryProblemComponent,
		OrderWarehousePreparationProblemComponent,
		CommonComponent,
		AccountComponent,
		LocationComponent,
		PhoneComponent,
	],
})
export class ComponentsModule {}
