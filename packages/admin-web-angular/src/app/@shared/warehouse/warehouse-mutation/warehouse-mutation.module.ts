import { NgModule } from '@angular/core';
import { WarehouseMutationComponent } from './warehouse-mutation.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormWizardModule } from '@app/@shared/wizard';
import { ThemeModule } from '../../../@theme';
import { WarehouseFormsModule } from '../forms';
import { LocationFormModule } from '../../forms/location';
import { GoogleMapModule } from '../../forms/google-map/google-map.module';
import { NbSpinnerModule } from '@nebular/theme';

@NgModule({
    imports: [
        ThemeModule,
        FormWizardModule,
        TranslateModule.forChild(),
        WarehouseFormsModule,
        LocationFormModule,
        GoogleMapModule,
        NbSpinnerModule,
    ],
    exports: [WarehouseMutationComponent],
    declarations: [WarehouseMutationComponent]
})
export class WarehouseMutationModule {}
