import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings';
import { SettingsPaymentsComponent } from './payments/payments';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import {
	IonAvatar,
	IonButton,
	IonCheckbox,
	IonCol,
	IonGrid,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonList,
	IonRow,
	IonSelect,
	IonSelectOption,
	ModalController,
} from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentMutationComponent } from './payments/mutation/mutation';
import { ConfirmDeletePopupModule } from '../../confirm-delete-popup/confirm-delete-popup.module';
import { StripeGatewayComponent } from './payments/stripe/stripe';
import { FileUploaderModule } from '../../file-uploader/file-uploader.module';
import { CurrenciesService } from '../../../services/currencies.service';
import { PayPalGatewayComponent } from './payments/payPal/payPal';

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsPaymentsComponent,
        PaymentMutationComponent,
        StripeGatewayComponent,
        PayPalGatewayComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule.forChild(),
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        ConfirmDeletePopupModule,
        FileUploaderModule,
        IonAvatar,
        IonButton,
        IonCheckbox,
        IonCol,
        IonGrid,
        IonIcon,
        IonInput,
        IonItem,
        IonLabel,
        IonList,
        IonRow,
        IonSelect,
        IonSelectOption,
    ],
    exports: [SettingsComponent],
    providers: [CurrenciesService, ModalController]
})
export class MerchantSettingsComponentModule {}
