import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { AccountFormComponent } from './account-form.component';
import { IonicModule } from '@ionic/angular/lazy';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonicModule,
		FileUploadModule,
		TranslateModule.forChild(),
		FormsModule,
	],
	declarations: [AccountFormComponent],
	exports: [AccountFormComponent],
})
export class CarrierAccountFormsModule {}
