import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings';
import { SettingsPaymentsComponent } from './payments/payments';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonicModule } from '@ionic/angular/lazy';
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
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        ConfirmDeletePopupModule,
        FileUploaderModule,
    ],
    exports: [SettingsComponent],
    providers: [CurrenciesService]
})
export class MerchantSettingsComponentModule {}
