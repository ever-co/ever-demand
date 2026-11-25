import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';
import { RouterModule, Routes } from '@angular/router';
import { DeviceComponent } from './device.component';
import { DeviceMutationComponent } from './device-mutation/device-mutation.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { ToasterModule } from '@app/@core/toaster';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { ConfirmationModalModule } from '../../@shared/confirmation-modal/confirmation-modal.module';

const routes: Routes = [
	{
		path: '',
		component: DeviceComponent,
	},
];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        Ng2SmartTableModule,
        NbSpinnerModule,
        ConfirmationModalModule,
        ToasterModule.forRoot(),
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
        NbButtonModule,
    ],
    providers: [NotifyService],
    declarations: [DeviceComponent, DeviceMutationComponent],
    exports: []
})
export class DeviceModule {
	public static routes = routes;

	constructor() {}
}
