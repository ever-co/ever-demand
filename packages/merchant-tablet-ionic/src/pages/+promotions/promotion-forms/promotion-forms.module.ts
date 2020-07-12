import { NgModule } from '@angular/core';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { DetailsInfoFormComponent } from './details-info/details-info-form.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploaderModule } from 'components/file-uploader/file-uploader.module';
import { CommonModule } from '@angular/common';

const COMPONENTS = [BasicInfoFormComponent, DetailsInfoFormComponent];

@NgModule({
	declarations: COMPONENTS,
	exports: COMPONENTS,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		IonicModule,
		FileUploaderModule,
	],
})
export class PromotionFormsModule {}
