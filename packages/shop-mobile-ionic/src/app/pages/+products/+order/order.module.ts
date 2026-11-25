import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { OrderPage } from './order.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderPopupComponent } from './order-popup.component';
import { ElapsedTimeModule } from '../../../components/elapsed-time/elapsed-time.module';
import { StripeLoader } from 'app/services/stripeLoader';
import { OrderInfoCommonModule } from './common/order-info-common.module';

// Shown as a modal only. Its old route ("/test") could never match: a path
// cannot start with a slash, which the Angular 22 router rejects in dev mode.
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
        ElapsedTimeModule,
        OrderInfoCommonModule,
    ],
    declarations: [OrderPage, OrderPopupComponent],
    providers: [
        StripeLoader,
        {
            provide: OrderPageModule,
            useFactory: stripeLoaderFactory,
            deps: [StripeLoader],
        },
    ]
})
export class OrderPageModule {}

export function stripeLoaderFactory(provider: StripeLoader) {
	return () => provider;
}
