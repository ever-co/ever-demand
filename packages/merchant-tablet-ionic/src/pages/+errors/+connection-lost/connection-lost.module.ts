import { NgModule } from '@angular/core';
import { ConnectionLostPage } from './connection-lost';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';

const routes: Routes = [
	{
		path: '',
		component: ConnectionLostPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		IonContent,
	],
	declarations: [ConnectionLostPage],
})
export class ConnectionLostPageModule {}
