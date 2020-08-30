import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ConnectionLostPage } from './connection-lost.page';
import { TranslateModule } from '@ngx-translate/core';

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
