import { NgModule } from '@angular/core';
import { PriceCountInputComponent } from './price-countInput/price-countInput.component';
import { RedirectIdComponent } from './redirect-id';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { RedirectNameComponent } from './name-redirect/name-redirect.component';
import { CreatedComponent } from './created/created.component';
import { ProductTitleRedirectComponent } from './product-title-redirect/product-title-redirect.component';
import { ProductImageRedirectComponent } from './product-image-redirect/product-image-redirect.component';
import { ProductCheckboxComponent } from './product-checkbox/product-checkbox';
import { MomentModule } from 'ngx-moment';
import { ProductTitleComponent } from './product-title/product-title.component';
import { ProductImageComponent } from './product-image/product-image.component';
import { CustomerEmailComponent } from './customer-email/customer-email.component';
import { CustomerPhoneComponent } from './customer-phone/customer-phone.component';
import { CheckboxComponent } from './customer-orders-table/checkbox/checkbox.component';

const COMPONENTS = [
	PriceCountInputComponent,
	RedirectIdComponent,
	RedirectNameComponent,
	CreatedComponent,
	ProductTitleRedirectComponent,
	ProductImageRedirectComponent,
	ProductCheckboxComponent,
	CheckboxComponent,
	ProductTitleComponent,
	ProductImageComponent,
	CustomerEmailComponent,
	CustomerPhoneComponent,
];

@NgModule({
	imports: [CommonModule, ThemeModule, MomentModule],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
})
export class RenderComponentsModule {}
