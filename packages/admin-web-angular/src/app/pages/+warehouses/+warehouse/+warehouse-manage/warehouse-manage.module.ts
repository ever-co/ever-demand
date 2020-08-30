import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { LocationFormModule } from '../../../../@shared/forms/location';
import { WarehouseFormsModule } from '../../../../@shared/warehouse/forms';
import { GoogleMapModule } from '../../../../@shared/forms/google-map/google-map.module';
import { ThemeModule } from '../../../../@theme';
import { WarehouseManageComponent } from './warehouse-manage.component';
import { ToasterModule } from 'angular2-toaster';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

const routes: Routes = [
	{
		path: '',
		component: WarehouseManageComponent,
	},
];

@NgModule({
	imports: [
		ThemeModule,
		ToasterModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		WarehouseFormsModule,
		LocationFormModule,
		GoogleMapModule,
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [WarehouseManageComponent],
})
export class WarehouseManageModule {}
