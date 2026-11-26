import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { CreateProductTypePopupPage } from './create-product-type-popup';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonCheckbox,
	IonCol,
	IonIcon,
	IonItem,
	IonRow,
	IonSelect,
	IonSelectOption,
	ModalController,
} from '@ionic/angular';
import { ProductImagesPopupModule } from '../product-pictures-popup/product-images-popup.module';

@NgModule({
    declarations: [CreateProductTypePopupPage],
    providers: [ProductsCategoryService, ModalController],
    imports: [
        FileUploadModule,
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
        ProductImagesPopupModule,
        IonCheckbox,
        IonCol,
        IonIcon,
        IonItem,
        IonRow,
        IonSelect,
        IonSelectOption,
    ]
})
export class CreateProductTypePopupPageModule {}
