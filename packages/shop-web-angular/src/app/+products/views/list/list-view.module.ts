import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductModule } from 'app/+products/product/product.module';
import { ViewTypeModule } from 'app/view-type/view-type.modeule';
import { ListViewComponent } from './list-view.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MasonryModule } from '@modules/masonry';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		FormsModule,
		MatCardModule,
		ProductModule,
		ViewTypeModule,
		MatIconModule,
		InfiniteScrollModule,
		MasonryModule,
	],
	declarations: [ListViewComponent],
	exports: [ListViewComponent],
})
export class ListViewModule {}
