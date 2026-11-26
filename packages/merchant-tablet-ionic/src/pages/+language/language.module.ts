import { NgModule } from '@angular/core';
import { LanguagePage } from './language';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


const routes: Routes = [
	{
		path: '',
		component: LanguagePage,
	},
];

@NgModule({
	declarations: [LanguagePage],
	imports: [
		IonicModule,
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
	],
	providers: [Store],
})
export class LanguagePageModule {}
