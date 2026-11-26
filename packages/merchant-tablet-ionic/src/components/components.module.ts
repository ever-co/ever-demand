import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading';
import { OrderWithoutCarrierComponent } from './order-without-carrier/order-without-carrier';
import { CommonModule } from '@angular/common';
import { OrderControlButtonsComponent } from './order-control-buttons/order-control-buttons';
import { OrderWithCarrierComponent } from './order-with-carrier/order-with-carrier';
import { OrderDeliveredComponent } from './order-delivered/order-delivered';
import { OrderCanceledComponent } from './order-canceled/order-canceled';
import { OrderDeliveryProblemComponent } from './order-delivery-problem/order-delivery-problem';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
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
import { TimeAgoPipe } from './time-ago.pipe';
import { OrderWarehousePreparationProblemComponent } from './order-warehouse-preparation-problem/order-warehouse-preparation-problem';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { ModalController } from '@ionic/angular/modal-controller';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderMapPopupPageModule } from './order-map-popup/order-map-popup.module';
import { CustomerEmailPopupPageModule } from '../pages/+customers/customer-email-popup/customer-email-popup.module';
import { CustomerDeliveriesPopupPageModule } from '../pages/+customers/customer-deliveries-popup/customer-deliveries-popup.module';
import { CustomerAddrPopupPageModule } from '../pages/+customers/customer-addr-popup/customer-addr-popup.module';
import { FileUploaderModule } from './file-uploader/file-uploader.module';
import { OrderInfoComponent } from './common/order-info/order-info';
import { ImageTableComponent } from './table-components/image-table';

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
		OrderInfoComponent,
		CarrierInfoComponent,
		PhoneComponent,
		UserPhoneComponent,
		ImageTableComponent,
		TimeAgoPipe,
	],
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		FormsModule,
		ReactiveFormsModule,
		GoogleMapModule,
		OrderMapPopupPageModule,
		CustomerEmailPopupPageModule,
		CustomerDeliveriesPopupPageModule,
		CustomerAddrPopupPageModule,
		FileUploaderModule,
		IonButton,
		IonCheckbox,
		IonCol,
		IonGrid,
		IonIcon,
		IonInput,
		IonItem,
		IonRow,
		IonSearchbar,
		IonSelect,
		IonSelectOption,
		IonSpinner,
	],
	providers: [ModalController],
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
		ImageTableComponent,
		TimeAgoPipe,
	],
})
export class ComponentsModule {}
