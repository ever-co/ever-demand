import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { InvitePage } from './invite.page';
import { ByLocationModuleGuard } from './+by-location/by-location.module.guard';
import { ByCodeModuleGuard } from './+by-code/by-code.module.guard';

const routes: Routes = [
	{
		path: '',
		component: InvitePage,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'by-code',
			},
			{
				path: 'by-code',
				loadChildren: () =>
					import('./+by-code/by-code.module').then(
						(m) => m.ByCodePageModule
					),
				canLoad: [ByCodeModuleGuard],
			},
			{
				path: 'by-location',
				loadChildren: () =>
					import('./+by-location/by-location.module').then(
						(m) => m.ByLocationPageModule
					),
				canLoad: [ByLocationModuleGuard],
			},
		],
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
	],
	providers: [ByLocationModuleGuard, ByCodeModuleGuard],
	declarations: [InvitePage],
})
export class InvitePageModule {}
