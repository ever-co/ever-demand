import { NgModule } from '@angular/core';
import { GetProductPage } from './get-product';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: GetProductPage
	}
];

@NgModule({
	declarations: [GetProductPage],
	imports: [TranslateModule.forChild(), RouterModule.forChild(routes)]
})
export class GetProductPageModule {}
