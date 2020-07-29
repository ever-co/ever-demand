import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CallPage } from './call.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
	{
		path: 'call-us',
		component: CallPage,
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
	declarations: [CallPage],
	entryComponents: [CallPage],
	exports: [CallPage],
})
export class CallPageModule {}
