import { NgModule } from '@angular/core';
import { ProductImagesPopup } from './product-images-popup.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { FileUploaderModule } from '../../../components/file-uploader/file-uploader.module';

@NgModule({
    declarations: [ProductImagesPopup],
    providers: [],
    imports: [
        FileUploaderModule,
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
        IonicModule,
    ]
})
export class ProductImagesPopupModule {}
