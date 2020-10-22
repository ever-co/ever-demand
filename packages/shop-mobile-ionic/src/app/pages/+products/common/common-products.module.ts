import { NgModule } from '@angular/core';
import { StoreSignComponent } from './store-sign/store-sign.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OrderSignComponent } from './order-sign/order-sign.component';
import { OrdersService } from 'app/services/orders/orders.service';

const COMPONENTS = [StoreSignComponent, OrderSignComponent];

@NgModule({
	imports: [CommonModule, TranslateModule.forChild()],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [OrdersService],
})
export class CommonProducts {}
