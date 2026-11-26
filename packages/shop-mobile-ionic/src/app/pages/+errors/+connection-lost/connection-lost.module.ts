import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { ConnectionLostPage } from './connection-lost.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

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
		IonContent,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [ConnectionLostPage],
})
export class ConnectionLostPageModule {}
