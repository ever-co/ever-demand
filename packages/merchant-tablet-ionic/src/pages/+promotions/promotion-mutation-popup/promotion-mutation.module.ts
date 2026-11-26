import { NgModule } from '@angular/core';
import { PromotionMutation } from './promotion-mutation';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import {
	IonButton,
	IonCol,
	IonGrid,
	IonRow,
	ModalController,
} from '@ionic/angular';
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
