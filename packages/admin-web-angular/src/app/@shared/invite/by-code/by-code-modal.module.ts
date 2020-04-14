import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../../@theme/theme.module';
import { ByCodeModalComponent } from './by-code-modal.component';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [ThemeModule, TranslateModule.forChild(), NbButtonModule],
	exports: [ByCodeModalComponent],
	declarations: [ByCodeModalComponent],
	entryComponents: [ByCodeModalComponent],
})
export class ByCodeModalModule {}
