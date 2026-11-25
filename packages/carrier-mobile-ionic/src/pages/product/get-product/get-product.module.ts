import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { GetProductPage } from './get-product';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { MenuModule } from '../../../components/menu/menu.module';

const routes: Routes = [
	{
		path: '',
		component: GetProductPage,
	},
];

@NgModule({
	// <swiper-container> / <swiper-slide> are Swiper custom elements (registered in main.ts).
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [GetProductPage],
	imports: [
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		CommonModule,
		IonicModule,
		MenuModule,
	],
	providers: [],
})
export class GetProductPageModule {}
