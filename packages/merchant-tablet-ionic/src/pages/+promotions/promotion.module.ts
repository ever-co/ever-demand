import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CommonModule } from '@angular/common';
import { PromotionService } from 'services/promotion.service';
import { PromotionMutationModule } from './promotion-mutation-popup/promotion-mutation.module';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'all',
	},
	{
		path: 'all',
		loadChildren: () =>
			import('./promotion-table-page/promotion-table.module').then(
				(m) => m.PromotionTableModule
			),
	},
];

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		IonicModule,
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		PromotionMutationModule,
	],
	exports: [RouterModule],
	providers: [PromotionService],
})
export class PromotionModule {}
