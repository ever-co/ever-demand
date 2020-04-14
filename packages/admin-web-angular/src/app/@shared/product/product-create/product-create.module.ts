import { NgModule } from '@angular/core';
import { ThemeModule } from '../../../@theme/theme.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ProductCreateComponent } from './product-create.component';
import { ProductFormsModule } from '../forms';
import { NbSpinnerModule } from '@nebular/theme';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),

		ProductFormsModule,
		NbSpinnerModule,
	],
	exports: [ProductCreateComponent],
	declarations: [ProductCreateComponent],
	entryComponents: [ProductCreateComponent],
})
export class ProductCreateModule {}
