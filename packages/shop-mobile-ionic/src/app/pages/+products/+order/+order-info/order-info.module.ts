import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderInfoPage } from './order-info.page';
import { CancelPageModule } from '../+cancel/cancel.module';
import { UserWarehouseLocationComponent } from './user-warehouse-map/user-warehouse-map';
import { IssuePageModule } from '../issue/issue.module';
import { ElapsedTimeModule } from '../../../../components/elapsed-time/elapsed-time.module';
import { StripeLoader } from 'app/services/stripeLoader';
import { OrderInfoCommonModule } from '../common/order-info-common.module';

const routes: Routes = [
	{
		path: '',
		component: OrderInfoPage,
	},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        CancelPageModule,
        IssuePageModule,
        ElapsedTimeModule,
        OrderInfoCommonModule,
    ],
    declarations: [OrderInfoPage, UserWarehouseLocationComponent],
    providers: [
        StripeLoader,
        {
            provide: OrderInfoPageModule,
            useFactory: stripeLoaderFactory,
            deps: [StripeLoader],
        },
    ]
})
export class OrderInfoPageModule {}

export function stripeLoaderFactory(provider: StripeLoader) {
	return () => provider;
}
