import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CancelPageModule } from '../+cancel/cancel.module';
import { IssuePageModule } from '../issue/issue.module';
import { ElapsedTimeModule } from 'app/components/elapsed-time/elapsed-time.module';
import { DirectionsLocationComponent } from './carreir-location/carreir-location';
import { OrderInfoHeaderComponent } from './header/order-info-header.component';
import { PaymentComponent } from './payment/payment.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { MercadoPaymentComponent } from './mercado-payment/mercado-payment.component';
import { MercadoAcceptCardComponent } from './mercado-accept-card/mercado-accept-card.component';
import { MercadoListCardComponent } from './mercado-list-cards/mercado-list-cards.component';

const COMPONENTS = [
	DirectionsLocationComponent,
	OrderInfoHeaderComponent,
	PaymentComponent,
	MapModalComponent,
	MercadoPaymentComponent,
	MercadoAcceptCardComponent,
	MercadoListCardComponent,
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		TranslateModule.forChild(),
		CancelPageModule,
		IssuePageModule,
		ElapsedTimeModule,
		ReactiveFormsModule,
	],
	entryComponents: [...COMPONENTS],
	declarations: [...COMPONENTS],
	exports: [...COMPONENTS],
	providers: [],
})
export class OrderInfoCommonModule {}
