import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { IssuePage } from './issue.page';
import { TranslateModule } from '@ngx-translate/core';

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
	declarations: [IssuePage],
	entryComponents: [IssuePage],
})
export class IssuePageModule {}
