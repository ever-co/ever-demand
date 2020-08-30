import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { ProductsCommonModule } from '../common/common.module';
import { WarehouseLogoModule } from 'app/warehouse-logo';
import { ProductComponent } from '.';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		FormsModule,
		MatCardModule,
		MatButtonModule,
		RouterModule,
		ProductsCommonModule,
		WarehouseLogoModule,
	],
	exports: [ProductComponent],
	declarations: [ProductComponent],
})
export class ProductModule {}
