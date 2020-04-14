import { NgModule } from '@angular/core';
import { ThemeModule } from '../../../@theme/theme.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { WarehouseProductCreateComponent } from './warehouse-product-create.component';
import { WarehouseProductFormsModule } from '../forms';
import { ProductFormsModule } from '../../product/forms';
import { NbSpinnerModule } from '@nebular/theme';
import { NotifyService } from '@app/@core/services/notify/notify.service';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		WarehouseProductFormsModule,
		ProductFormsModule,
		NbSpinnerModule,
	],
	providers: [NotifyService],
	exports: [WarehouseProductCreateComponent],
	declarations: [WarehouseProductCreateComponent],
	entryComponents: [WarehouseProductCreateComponent],
})
export class WarehouseProductCreateModule {}
