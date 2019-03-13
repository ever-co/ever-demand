import { NgModule } from '@angular/core';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload';
import { CreateProductTypePopupPage } from './create-product-type-popup';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
	declarations: [CreateProductTypePopupPage],
	entryComponents: [CreateProductTypePopupPage],
	providers: [FileTransfer, ProductsCategoryService],
	imports: [
		FileUploadModule,
		TranslateModule.forChild(),
		CommonModule,
		FormsModule,
		IonicModule
	]
})
export class CreateProductTypePopupPageModule {}
