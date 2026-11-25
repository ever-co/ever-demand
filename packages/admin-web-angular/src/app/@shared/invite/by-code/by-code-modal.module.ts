import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ThemeModule } from '../../../@theme/theme.module';
import { ByCodeModalComponent } from './by-code-modal.component';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
    imports: [ThemeModule, TranslateModule.forChild(), NbButtonModule],
    exports: [ByCodeModalComponent],
    declarations: [ByCodeModalComponent]
})
export class ByCodeModalModule {}
