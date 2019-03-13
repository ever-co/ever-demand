import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { LocationFormComponent } from './location/location-form.component';
import { TranslateModule } from '@ngx-translate/core';
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
	declarations: [BasicInfoFormComponent, LocationFormComponent],
	exports: [BasicInfoFormComponent, LocationFormComponent]
})
export class UserFormsModule {}
