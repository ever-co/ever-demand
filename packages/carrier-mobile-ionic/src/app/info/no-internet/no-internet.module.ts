import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoInternetPage } from './no-internet';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

const routes: Routes = [
	{
		path: '',
		component: NoInternetPage,
	},
];

@NgModule({
    declarations: [NoInternetPage],
    imports: [
        CommonModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
    ],
    exports: [NoInternetPage]
})
export class NoInternerModule {}
