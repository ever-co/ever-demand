import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ServerDownPage } from './server-down.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ThemeModule } from '@app/@theme';

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
		ThemeModule,
		RouterModule.forChild(routes),
		TranslateModule,
	],
	declarations: [ServerDownPage],
})
export class ServerDownModule {}
