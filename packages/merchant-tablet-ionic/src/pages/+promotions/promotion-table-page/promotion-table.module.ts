import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PromotionTable } from './promotion-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonIcon, IonMenuToggle, ModalController } from '@ionic/angular';
import { PromotionService } from '../../../services/promotion.service';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { CommonModule } from '@angular/common';
import { ConfirmDeletePopupModule } from '../../../components/confirm-delete-popup/confirm-delete-popup.module';
import { ComponentsModule } from '../../../components/components.module';
import { ImageTableComponent } from '../../../components/table-components/image-table';

const routes: Routes = [
	{
		path: '',
		component: PromotionTable,
	},
];

@NgModule({
    declarations: [PromotionTable],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        Angular2SmartTableModule,
        ConfirmDeletePopupModule,
        ComponentsModule,
        IonIcon,
        IonMenuToggle,
    ],
    providers: [PromotionService, ModalController],
    exports: [RouterModule]
})
export class PromotionTableModule {}
