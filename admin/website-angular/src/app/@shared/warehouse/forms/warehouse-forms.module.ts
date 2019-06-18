import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme/theme.module';
import { BasicInfoFormComponent } from './basic-info';
import { ContactInfoFormComponent } from './contact-info';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { WarehouseManageTabsComponent } from './warehouse-manage-tabs/warehouse-manage-tabs.component';
import { GoogleMapModule } from '../../forms/google-map/google-map.module';
import { LocationFormModule } from '../../forms/location';
import { WarehouseManageTabsDetailsComponent } from './warehouse-manage-tabs/details/warehouse-manage-tabs-details.component';
import { WarehouseManageTabsAccountComponent } from './warehouse-manage-tabs/account/warehouse-manage-tabs-account.component';
import { WarehouseManageTabsDeliveryAreasComponent } from './warehouse-manage-tabs/delivery-areas/warehouse-manage-tabs-delivery-areas.component';
import { FileUploaderModule } from 'app/@shared/file-uploader/file-uploader.module';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		MultiselectDropdownModule,
		FileUploaderModule,
		GoogleMapModule,
		LocationFormModule,
		NbButtonModule
	],
	exports: [
		WarehouseManageTabsComponent,
		WarehouseManageTabsDetailsComponent,
		WarehouseManageTabsAccountComponent,
		BasicInfoFormComponent,
		ContactInfoFormComponent,
		WarehouseManageTabsDeliveryAreasComponent
	],
	declarations: [
		WarehouseManageTabsComponent,
		WarehouseManageTabsDetailsComponent,
		WarehouseManageTabsAccountComponent,
		BasicInfoFormComponent,
		ContactInfoFormComponent,
		WarehouseManageTabsDeliveryAreasComponent
	]
})
export class WarehouseFormsModule {}
