import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '@app/@theme';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';
import { MerchantsSetupInstructionsComponent } from './instructions/instructions.component';
import { SetupMerchantAccountComponent } from './account/account.component';
import { SetupMerchantBasicInfoComponent } from './basic-info/basic-info.component';
import { SetupMerchantContactInfoComponent } from './contact-info/contact-info.component';
import { SetupMerchantManufacturingComponent } from './manufacturing/manufacturing.component';
import { SetupMerchantOrdersSettingsComponent } from './settings/orders/orders.component';
import { NbRadioModule, NbButtonModule } from '@nebular/theme';
import { SetupMerchantProductCategoriesComponent } from './product-categories/product-categories.component';
import { ProductCategoriesFormsModule } from '@app/@shared/product/categories/forms/product-categories-forms.module';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { NgxBarcodeModule } from '@modules/client.common.angular2/components/ngx-barcode/ngx-barcode.module';

const COMPONENTS = [
	SetupMerchantAccountComponent,
	SetupMerchantBasicInfoComponent,
	SetupMerchantContactInfoComponent,
	MerchantsSetupInstructionsComponent,
	SetupMerchantManufacturingComponent,
	SetupMerchantOrdersSettingsComponent,
	SetupMerchantProductCategoriesComponent,
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		NbRadioModule,
		TranslateModule.forChild(),
		FileUploaderModule,
		ProductCategoriesFormsModule,
		NgxBarcodeModule,
		NbButtonModule,
	],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [NotifyService],
})
export class SetupMerchantsComponentsModule {}
