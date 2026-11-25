import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { ToasterModule } from '@app/@core/toaster';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

const COMPONENTS = [ConfirmationModalComponent];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        TranslateModule.forChild(),
        ToasterModule.forRoot(),
        NbSpinnerModule,
        NbButtonModule,
    ],
    declarations: COMPONENTS,
    exports: COMPONENTS
})
export class ConfirmationModalModule {}
