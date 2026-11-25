import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { ThemeModule } from '../../../@theme';
import { WarehouseOrderModalComponent } from './warehouse-order-modal.component';
import { WarehouseOrderInputComponent } from './warehouse-order-input.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { MakeOrderCommentComponent } from './make-order-comment.component';

const COMPONENTS = [
	WarehouseOrderModalComponent,
	WarehouseOrderInputComponent,
	MakeOrderCommentComponent,
];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        Ng2SmartTableModule,
        NbSpinnerModule,
        NbSpinnerModule,
        TranslateModule.forChild(),
        NbButtonModule,
    ],
    declarations: [
        WarehouseOrderModalComponent,
        WarehouseOrderInputComponent,
        MakeOrderCommentComponent,
    ],
    exports: COMPONENTS
})
export class WarehouseOrderModalModule {}
