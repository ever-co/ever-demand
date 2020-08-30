import { NgModule } from '@angular/core';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FileUploadModule } from 'ng2-file-upload';
import { EditProductTypePopupPage } from './edit-product-type-popup';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductImagesPopupModule } from '../product-pictures-popup/product-images-popup.module';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	declarations: [EditProductTypePopupPage],
	entryComponents: [EditProductTypePopupPage],
	providers: [FileTransfer, ProductsCategoryService],
	imports: [
		FileUploadModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		CommonModule,
		FormsModule,
		IonicModule,
		ProductImagesPopupModule,
	],
})
export class EditProductTypePopupPageModule {}
