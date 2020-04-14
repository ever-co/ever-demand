import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { RouterModule } from '@angular/router';
import { routes } from './product.routes';
import { FormWizardModule } from 'angular2-wizard';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightModule } from 'ngx-highlightjs';
import { ProductComponent } from './product.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		HighlightModule.forRoot({ theme: 'github' }),
	],
	declarations: [ProductComponent],
})
export class ProductModule {}
