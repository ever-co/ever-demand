import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { DeliveriesPage } from './deliveries';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderCardModule } from '../../components/order-card/order-card.module';
import { IonicModule } from '@ionic/angular/lazy';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: DeliveriesPage,
	},
];

@NgModule({
	declarations: [DeliveriesPage],
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		OrderCardModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
})
export class DeliveriesPageModule {}
