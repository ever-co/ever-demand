import { NgModule } from '@angular/core';
import { GetProductPage } from './get-product';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MenuModule } from 'components/menu/menu.module';

const routes: Routes = [
	{
		path: '',
		component: GetProductPage,
	},
];

@NgModule({
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
