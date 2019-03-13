import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { FileUploadModule } from 'ng2-file-upload';
import { IonicModule } from '@ionic/angular';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonicModule,
		FormsModule,
		FileUploadModule,
		TranslateModule.forChild()
	],
	declarations: [BasicInfoFormComponent],
	exports: [BasicInfoFormComponent]
})
export class CarrierBasicFormsModule {}
