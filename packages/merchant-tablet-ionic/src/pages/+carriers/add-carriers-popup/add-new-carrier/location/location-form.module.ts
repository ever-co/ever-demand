import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload';
import { LocationFormComponent } from './location-form.component';
import { GoogleMapModule } from '../../../../../@shared/google-map/google-map.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonicModule,
		FileUploadModule,
		GoogleMapModule,
		TranslateModule.forChild(),
		FormsModule,
	],
	declarations: [LocationFormComponent],
	exports: [LocationFormComponent],
})
export class CarrierLocationFormsModule {}
