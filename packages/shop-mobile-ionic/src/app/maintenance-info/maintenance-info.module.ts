import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MaintenanceInfoPage } from './maintenance-info.page';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';

const routes: Routes = [
	{
		path: '',
		component: MaintenanceInfoPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		PipesModule,
	],
	providers: [MaintenanceService],
	declarations: [MaintenanceInfoPage],
})
export class MaintenanceInfoPageModule {}
