import { NgModule } from '@angular/core';
import { ProductImagesPopup } from './product-images-popup.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonGrid,
	IonIcon,
	IonRow,
	ModalController,
} from '@ionic/angular';
import { FileUploaderModule } from '../../../components/file-uploader/file-uploader.module';

@NgModule({
    declarations: [ProductImagesPopup],
    providers: [ModalController],
    imports: [
        FileUploaderModule,
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
        IonButton,
        IonGrid,
        IonIcon,
        IonRow,
    ]
})
export class ProductImagesPopupModule {}
