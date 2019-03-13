import { NgModule } from '@angular/core';
import { TrackPage } from './track';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { CarrierService } from '../../../src/services/carrier.service';
import { WarehousesService } from '../../../src/services/warehouses.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
	{
		path: '',
		component: TrackPage
	}
];

@NgModule({
	declarations: [TrackPage],
	imports: [
		PipesModule,
		ComponentsModule,
		TranslateModule.forChild(),
		IonicModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes)
	],
	providers: [CarrierService, WarehousesService]
})
export class TrackPageModule {}
