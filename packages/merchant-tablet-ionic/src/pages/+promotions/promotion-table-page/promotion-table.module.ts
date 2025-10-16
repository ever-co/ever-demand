import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PromotionTable } from './promotion-table';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { PromotionService } from 'services/promotion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CommonModule } from '@angular/common';
import { ConfirmDeletePopupModule } from 'components/confirm-delete-popup/confirm-delete-popup.module';
import { ComponentsModule } from 'components/components.module';
import { ImageTableComponent } from 'components/table-components/image-table';

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
        IonicModule,
        Ng2SmartTableModule,
        ConfirmDeletePopupModule,
        ComponentsModule,
    ],
    providers: [PromotionService],
    exports: [RouterModule]
})
export class PromotionTableModule {}
