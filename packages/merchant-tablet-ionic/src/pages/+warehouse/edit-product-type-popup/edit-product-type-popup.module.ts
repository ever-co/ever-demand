import { NgModule } from '@angular/core';
import { FileUploadModule } from 'ng2-file-upload';
import { EditProductTypePopupPage } from './edit-product-type-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductImagesPopupModule } from '../product-pictures-popup/product-images-popup.module';


@NgModule({
    declarations: [EditProductTypePopupPage],
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
export class EditProductTypePopupPageModule {}
