import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceCountInputComponent } from './price-countInput/price-countInput.component';
import { RedirectIdComponent } from './redirect-id';
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
import { IsAvailableCheckBox } from './store-product-is-available-checkbox/is-available-checkbox.component';
import { ProductTakeawayDeliveryComponent } from './product-takeaway-delivery/product-takeaway-delivery.component';
import { TranslateModule } from '@ngx-translate/core';

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
	IsAvailableCheckBox,
	ProductTakeawayDeliveryComponent,
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ThemeModule,
		MomentModule,
		TranslateModule.forChild(),
	],
	declarations: COMPONENTS
})
export class RenderComponentsModule {}
