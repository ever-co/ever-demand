import { NgModule } from '@angular/core';
import { MaintenanceInfoPage } from './maintenance-info';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
	{
		path: '',
		component: MaintenanceInfoPage,
	},
];

@NgModule({
	declarations: [MaintenanceInfoPage],
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		PipesModule,
	],
})
export class MaintenanceInfoPageModule {}
