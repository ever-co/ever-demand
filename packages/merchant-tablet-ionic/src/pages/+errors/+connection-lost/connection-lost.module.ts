import { NgModule } from '@angular/core';
import { ConnectionLostPage } from './connection-lost';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [ConnectionLostPage],
})
export class ConnectionLostPageModule {}
