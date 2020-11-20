import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OrderModule } from 'app/components/order/order.module';
import { OrderCardComponent } from './order-card.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		OrderModule,
		RouterModule,
		TranslateModule.forChild(),
	],
	declarations: [OrderCardComponent],
	exports: [OrderCardComponent],
	entryComponents: [OrderCardComponent],
})
export class OrdersCardModule {}
