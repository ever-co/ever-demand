import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CancelPage } from './cancel.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
	{
		path: '/cancel-page',
		component: CancelPage,
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
	declarations: [CancelPage],
	entryComponents: [CancelPage],
})
export class CancelPageModule {}
