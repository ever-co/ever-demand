import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ServerDownPage } from './server-down.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';


const routes: Routes = [
	{
		path: '',
		component: ServerDownPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		TranslateModule,
	],
	providers: [ServerConnectionService],
	declarations: [ServerDownPage],
})
export class ServerDownModule {}
