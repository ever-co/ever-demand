import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { UserFormsModule } from '../../../../@shared/user/forms';
import { LocationFormModule } from '../../../../@shared/forms/location';
import { GoogleMapModule } from '../../../../@shared/forms/google-map/google-map.module';
import { WarehouseOrderComponent } from './warehouse-order.component';
import { WarehouseOrderCreateUserComponent } from './create-user/warehouse-order-create-user.component';
import { WarehouseOrderModalModule } from '../../../../@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.module';
import { TranslateModule } from '@ngx-translate/core';
import { NbSpinnerModule } from '@nebular/theme';
import { ThemeModule } from '../../../../@theme';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		UserFormsModule,
		LocationFormModule,
		GoogleMapModule,
		WarehouseOrderModalModule,
		NbSpinnerModule,
	],
	declarations: [WarehouseOrderComponent, WarehouseOrderCreateUserComponent],
	entryComponents: [WarehouseOrderComponent],
})
export class WarehouseOrderModule {}
