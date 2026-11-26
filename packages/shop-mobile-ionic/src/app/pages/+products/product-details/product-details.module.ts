import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {
	IonButton,
	IonButtons,
	IonCard,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonImg,
	IonMenuButton,
	IonRow,
	IonTitle,
	IonToolbar,
} from '@ionic/angular';
import { ProductDetailsPage } from './product-details.page';
import { WarehouseLogoModule } from '../../../components/warehouse-logo/warehouse-logo.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderPageModule } from '../+order/order.module';
import { CancelPageModule } from '../+order/+cancel/cancel.module';
import { ProductsModule } from '../../../components/products/products.module';
import { OrderTakeawayInfoPopupModule } from '../+order/takeaway/popup/popup.module';


const routes: Routes = [
	{
		path: '',
		component: ProductDetailsPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonButton,
		IonButtons,
		IonCard,
		IonCol,
		IonContent,
		IonGrid,
		IonHeader,
		IonImg,
		IonMenuButton,
		IonRow,
		IonTitle,
		IonToolbar,
		WarehouseLogoModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		OrderPageModule,
		CancelPageModule,
		ProductsModule,
		OrderTakeawayInfoPopupModule,
	],
	providers: [],
	// <swiper-container> / <swiper-slide> (Swiper element) for the images
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [ProductDetailsPage],
})
export class ProductDetailsPageModule {}
