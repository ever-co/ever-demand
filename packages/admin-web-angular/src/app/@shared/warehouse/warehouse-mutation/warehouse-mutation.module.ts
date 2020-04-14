import { NgModule } from '@angular/core';
import { WarehouseMutationComponent } from './warehouse-mutation.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme';
import { WarehouseFormsModule } from '../forms';
import { LocationFormModule } from '../../forms/location';
import { GoogleMapModule } from '../../forms/google-map/google-map.module';
import { NbSpinnerModule } from '@nebular/theme';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		WarehouseFormsModule,
		LocationFormModule,
		GoogleMapModule,
		NbSpinnerModule,
	],
	exports: [WarehouseMutationComponent],
	declarations: [WarehouseMutationComponent],
	entryComponents: [WarehouseMutationComponent],
})
export class WarehouseMutationModule {}
