import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { CreateProductTypePopupPage } from './create-product-type-popup';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { ProductImagesPopupModule } from '../product-pictures-popup/product-images-popup.module';

@NgModule({
    declarations: [CreateProductTypePopupPage],
    providers: [ProductsCategoryService],
    imports: [
        FileUploadModule,
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
        IonicModule,
        ProductImagesPopupModule,
    ]
})
export class CreateProductTypePopupPageModule {}
