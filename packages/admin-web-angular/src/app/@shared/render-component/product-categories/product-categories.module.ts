import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { ProductCategoriesComponent } from './product-categories';

const COMPONENTS = [ProductCategoriesComponent];

@NgModule({
	imports: [CommonModule, ThemeModule],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class ProductCategoriesModule {}
