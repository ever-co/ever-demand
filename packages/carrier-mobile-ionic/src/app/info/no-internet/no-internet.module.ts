import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NoInternetPage } from './no-internet';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
	{
		path: '',
		component: NoInternetPage,
	},
];

@NgModule({
	declarations: [NoInternetPage],
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		IonicModule,
	],
	entryComponents: [NoInternetPage],
	exports: [NoInternetPage],
})
export class NoInternerModule {}
