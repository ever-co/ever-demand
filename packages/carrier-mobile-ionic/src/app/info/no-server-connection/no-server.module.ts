import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoServerConnectionComponent } from './no-server-connection';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

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
