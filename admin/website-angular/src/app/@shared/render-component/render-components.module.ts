import { NgModule } from '@angular/core';
import { PriceCountInputComponent } from './price-countInput.component';
import { RedirectIdComponent } from './redirect-id';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme';
import { RedirectNameComponent } from './name-redirect.component';
import { CreatedComponent } from './created.component';
import { ProductTitleRedirectComponent } from './product-title-redirect/product-title-redirect.component';
import { ProductImageRedirectComponent } from './product-image-redirect/product-image-redirect.component';
import { ProductCheckboxComponent } from './product-checkbox';
import { MomentModule } from 'ngx-moment';
import { CheckboxComponent } from './checkbox.component';
import { ProductTitleComponent } from './product-title/product-title.component';
import { ProductImageComponent } from './product-image/product-image.component';
import { CustomerEmailComponent } from './customer-email/customer-email.component';
import { CustomerPhoneComponent } from './customer-phone/customer-phone.component';

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
	CustomerPhoneComponent
];

@NgModule({
	imports: [CommonModule, ThemeModule, MomentModule],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS
})
export class RenderComponentsModule {}
