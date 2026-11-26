import { NgModule } from '@angular/core';

import { ReturnProductPage } from './return-product';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

const routes: Routes = [
	{
		path: '',
		component: ReturnProductPage,
	},
];

@NgModule({
	declarations: [ReturnProductPage],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
})
export class ReturnProductPageModule {}
