import { NgModule } from '@angular/core';
import { PromotionMutation } from './promotion-mutation';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PromotionService } from 'services/promotion.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromotionFormsModule } from '../promotion-forms/promotion-forms.module';

const COMPONENTS = [PromotionMutation];

@NgModule({
    declarations: COMPONENTS,
    exports: COMPONENTS,
    imports: [
        CommonModule,
        TranslateModule.forChild(),
        IonicModule,
        Ng2SmartTableModule,
        FormsModule,
        ReactiveFormsModule,
        PromotionFormsModule,
    ],
    providers: [PromotionService]
})
export class PromotionMutationModule {}
