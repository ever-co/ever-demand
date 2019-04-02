import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FileUploaderModule } from 'app/@shared/file-uploader/file-uploader.module';
import { MerchantsSetupInstructionsComponent } from './instructions/instructions.component';
import { SetupMerchantAccountComponent } from './account/account.component';
import { SetupMerchantBasicInfoComponent } from './basic-info/basic-info.component';
import { SetupMerchantContactInfoComponent } from './contact-info/contact-info.component';
import { SetupMerchantPaymentsComponent } from './payments/payments.component';
import { SetupMerchantManufacturingComponent } from './manufacturing/manufacturing.component';

const COMPONENTS = [
	SetupMerchantAccountComponent,
	SetupMerchantBasicInfoComponent,
	SetupMerchantContactInfoComponent,
	MerchantsSetupInstructionsComponent,
	SetupMerchantPaymentsComponent,
	SetupMerchantManufacturingComponent
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploaderModule
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
})
export class SetupMerchantsComponentsModule {}
