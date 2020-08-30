import { NgModule } from '@angular/core';
import { ProductImagesPopup } from './product-images-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FileUploaderModule } from 'components/file-uploader/file-uploader.module';

@NgModule({
	declarations: [ProductImagesPopup],
	entryComponents: [ProductImagesPopup],
	providers: [],
	imports: [
		FileUploaderModule,
		TranslateModule.forChild(),
		CommonModule,
		FormsModule,
		IonicModule,
	],
})
export class ProductImagesPopupModule {}
