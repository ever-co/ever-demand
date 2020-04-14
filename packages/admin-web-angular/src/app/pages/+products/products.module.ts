import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightModule } from 'ngx-highlightjs';
import { ProductsComponent } from './products.component';
import { CategoriesComponent } from './+categories/categories.component';
import { ProductCreateModule } from '../../@shared/product/product-create';
import { ProductFormsModule } from '../../@shared/product/forms';
import { CategoryCreateComponent } from '../../@shared/product/categories/category-create';
import { CategoryEditComponent } from '../../@shared/product/categories/category-edit/category-edit.component';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { ConfirmationModalModule } from '../../@shared/confirmation-modal/confirmation-modal.module';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';
import { ProductCategoriesFormsModule } from '@app/@shared/product/categories/forms/product-categories-forms.module';

const routes: Routes = [
	{
		path: 'list',
		component: ProductsComponent,
	},
	{
		path: 'categories',
		component: CategoriesComponent,
	},
	{
		path: 'list/:id',
		loadChildren: () =>
			import('./+product/product.module').then((m) => m.ProductModule),
	},
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		HighlightModule.forRoot({ theme: 'github' }),
		ProductCreateModule,
		ProductFormsModule,
		NbSpinnerModule,
		ConfirmationModalModule,
		FileUploaderModule,
		ProductCategoriesFormsModule,
		NbButtonModule,
	],
	declarations: [
		ProductsComponent,
		CategoryCreateComponent,
		CategoryEditComponent,
		CategoriesComponent,
	],
	entryComponents: [CategoryCreateComponent, CategoryEditComponent],
	providers: [JsonPipe, NotifyService],
})
export class ProductsModule {
	public static routes = routes;
}
