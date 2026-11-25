import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { IssuePage } from './issue.page';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

const routes: Routes = [
	{
		path: '/issue',
		component: IssuePage,
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
    declarations: [IssuePage]
})
export class IssuePageModule {}
