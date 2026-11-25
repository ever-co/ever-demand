import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
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
        IonicModule,
    ],
    exports: [NoInternetPage]
})
export class NoInternerModule {}
