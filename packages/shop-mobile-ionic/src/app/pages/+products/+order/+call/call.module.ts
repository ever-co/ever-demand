import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { CallPage } from './call.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

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
    exports: [CallPage]
})
export class CallPageModule {}
