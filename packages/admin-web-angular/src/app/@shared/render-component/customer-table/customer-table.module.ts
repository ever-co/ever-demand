import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { HighlightModule } from 'ngx-highlightjs';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CustomerImageComponent } from './customer-table/customer-image.component';
import { CustomerOrdersNumberComponent } from './customer-orders-number/customer-orders-number.component';

const COMPONENTS = [CustomerImageComponent, CustomerOrdersNumberComponent];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        HighlightModule,
        TranslateModule.forChild(),
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS
})
export class CustomerTableModule {}
