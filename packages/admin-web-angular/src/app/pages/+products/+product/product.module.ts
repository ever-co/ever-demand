import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { RouterModule } from '@angular/router';
import { routes } from './product.routes';
import { FormWizardModule } from '@app/@shared/wizard';
import { ToasterModule } from '@app/@core/toaster';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { HighlightModule } from 'ngx-highlightjs';
import { ProductComponent } from './product.component';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		HighlightModule,
	],
	declarations: [ProductComponent],
})
export class ProductModule {}
