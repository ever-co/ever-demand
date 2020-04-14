import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { LocationFormComponent } from './location/location-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { FileUploaderModule } from 'components/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonicModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploaderModule,
	],
	declarations: [BasicInfoFormComponent, LocationFormComponent],
	exports: [BasicInfoFormComponent, LocationFormComponent],
})
export class UserFormsModule {}
