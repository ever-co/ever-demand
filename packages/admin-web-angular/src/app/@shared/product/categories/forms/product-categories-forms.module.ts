import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BasicInfoFormComponent } from './basic-info';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';
import { ThemeModule } from '@app/@theme';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesTableComponent } from '../categories-table';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbSpinnerModule } from '@nebular/theme';
import { CategoryImageComponent } from '../categories-table/category-image.component';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
		FileUploaderModule,
		Ng2SmartTableModule,
		NbSpinnerModule,
		FormsModule,
		ConfirmationModalModule,
	],
	declarations: [
		BasicInfoFormComponent,
		CategoriesTableComponent,
		CategoryImageComponent,
	],
	exports: [BasicInfoFormComponent, CategoriesTableComponent],
	entryComponents: [CategoryImageComponent],
})
export class ProductCategoriesFormsModule {}
