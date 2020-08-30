import { NgModule } from '@angular/core';

import { ReturnProductPage } from './return-product';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
		IonicModule,
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
})
export class ReturnProductPageModule {}
