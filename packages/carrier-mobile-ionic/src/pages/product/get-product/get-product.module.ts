import { NgModule } from '@angular/core';
import { GetProductPage } from './get-product';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
	],
})
export class GetProductPageModule {}
