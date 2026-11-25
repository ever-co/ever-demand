import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { LanguagePage } from './language.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';


const routes: Routes = [
	{
		path: '',
		component: LanguagePage,
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
	declarations: [LanguagePage],
})
export class LanguagePageModule {
	constructor() {}
}
