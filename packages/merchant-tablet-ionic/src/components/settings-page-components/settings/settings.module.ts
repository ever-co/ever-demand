import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings';
import { SettingsPaymentsComponent } from './payments/payments';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonAvatar } from '@ionic/angular/ion-avatar';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { ModalController } from '@ionic/angular/modal-controller';
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
