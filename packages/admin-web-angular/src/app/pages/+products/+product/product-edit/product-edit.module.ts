import { NgModule } from '@angular/core';
import { ThemeModule } from '../../../../@theme/theme.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { RouterModule, Routes } from '@angular/router';
import { ToasterModule } from '@app/@core/toaster';
import { ProductEditComponent } from './product-edit.component';
import { ProductFormsModule } from '../../../../@shared/product/forms';
import { FormWizardModule } from '@app/@shared/wizard';
import { ProductsCategoryService } from '../../../../@core/data/productsCategory.service';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

export const routes: Routes = [
	{
		path: '',
		component: ProductEditComponent,
	},
];

@NgModule({
	imports: [
		ThemeModule,
		TranslateModule.forChild(),
		ToasterModule.forRoot(),
		RouterModule.forChild(routes),
		ProductFormsModule,
		FormWizardModule,
		NbSpinnerModule,
		NbButtonModule,
	],
	exports: [],
	declarations: [ProductEditComponent],
	providers: [ProductsCategoryService],
})
export class ProductEditModule {}
