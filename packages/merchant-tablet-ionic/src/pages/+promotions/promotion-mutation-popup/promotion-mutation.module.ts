import { NgModule } from '@angular/core';
import { PromotionMutation } from './promotion-mutation';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonRow } from '@ionic/angular/ion-row';
import { ModalController } from '@ionic/angular/modal-controller';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { PromotionService } from '../../../services/promotion.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromotionFormsModule } from '../promotion-forms/promotion-forms.module';

const COMPONENTS = [PromotionMutation];

@NgModule({
    declarations: COMPONENTS,
    exports: COMPONENTS,
    imports: [
        CommonModule,
        TranslateModule.forChild(),
        Angular2SmartTableModule,
        FormsModule,
        ReactiveFormsModule,
        PromotionFormsModule,
        IonButton,
        IonCol,
        IonGrid,
        IonRow,
    ],
    providers: [PromotionService, ModalController]
})
export class PromotionMutationModule {}
