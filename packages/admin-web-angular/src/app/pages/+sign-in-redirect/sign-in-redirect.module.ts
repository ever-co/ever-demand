import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SignInRedirectComponent } from './sign-in-redirect.component';
import { WarehousesService } from '@app/@core/data/warehouses.service';

@NgModule({
	imports: [
		RouterModule.forChild([
			{ path: '', component: SignInRedirectComponent },
		]),
	],
	declarations: [SignInRedirectComponent],
	providers: [WarehousesService],
})
export class SignInRedirectModule {}
