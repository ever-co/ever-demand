import { NgModule } from '@angular/core';
import { ProductImagesPopup } from './product-images-popup.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton } from '@ionic/angular/ion-button';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonRow } from '@ionic/angular/ion-row';
import { ModalController } from '@ionic/angular/modal-controller';
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
