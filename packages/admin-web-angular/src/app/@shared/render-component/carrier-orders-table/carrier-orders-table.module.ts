import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { StoreOrderComponent } from './store-order.component';
import { UserOrderComponent } from './user-order-component';

const COMPONENTS = [StoreOrderComponent, UserOrderComponent];

@NgModule({
    imports: [CommonModule, ThemeModule, TranslateModule.forChild()],
    declarations: COMPONENTS,
    exports: COMPONENTS
})
export class CarrierOrdersTableModule {}
