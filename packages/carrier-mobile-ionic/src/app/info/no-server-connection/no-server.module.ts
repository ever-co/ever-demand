import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoServerConnectionComponent } from './no-server-connection';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

const routes: Routes = [
	{
		path: '',
		component: NoServerConnectionComponent,
	},
];

@NgModule({
	declarations: [NoServerConnectionComponent],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		IonicModule,
	],
})
export class ServerDownModule {}
