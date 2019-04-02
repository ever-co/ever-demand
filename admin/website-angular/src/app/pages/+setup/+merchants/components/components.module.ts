import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { TranslateModule } from '@ngx-translate/core';
import { AccountComponent } from './account/account.component';
import { FormsModule } from '@angular/forms';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { FileUploaderModule } from 'app/@shared/file-uploader/file-uploader.module';
import { MerchantsSetupInstructionsComponent } from './instructions/instructions.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';

const COMPONENTS = [
	AccountComponent,
	BasicInfoComponent,
	ContactInfoComponent,
	MerchantsSetupInstructionsComponent
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
