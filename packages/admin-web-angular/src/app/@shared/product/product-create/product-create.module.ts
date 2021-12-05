import { NgModule } from '@angular/core';
import { ThemeModule } from '../../../@theme/theme.module';
import { FormWizardModule } from '@ever-co/angular2-wizard';
import { ProductCreateComponent } from './product-create.component';
import { ProductFormsModule } from '../forms';
import { NbSpinnerModule } from '@nebular/theme';
import { TranslateModule } from '@app/@shared/translate/translate.module';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule,
		ProductFormsModule,
		NbSpinnerModule,
	],
	exports: [ProductCreateComponent],
	declarations: [ProductCreateComponent]
})
export class ProductCreateModule {}
