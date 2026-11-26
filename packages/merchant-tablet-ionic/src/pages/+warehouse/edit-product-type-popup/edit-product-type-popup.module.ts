import { NgModule } from '@angular/core';
import { FileUploadModule } from 'ng2-file-upload';
import { EditProductTypePopupPage } from './edit-product-type-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { ModalController } from '@ionic/angular/modal-controller';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductImagesPopupModule } from '../product-pictures-popup/product-images-popup.module';


@NgModule({
    declarations: [EditProductTypePopupPage],
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
export class EditProductTypePopupPageModule {}
