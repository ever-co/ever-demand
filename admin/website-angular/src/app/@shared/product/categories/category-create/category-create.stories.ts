import { storiesOf, moduleMetadata } from '@storybook/angular';

import { of } from 'rxjs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeModule } from 'app/@theme';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbSpinnerModule } from '@nebular/theme';
import { ConfirmationModalModule } from 'app/@shared/confirmation-modal/confirmation-modal.module';
import { ToasterModule } from 'angular2-toaster';
import {
	TranslateModule,
	TranslateStore,
	TranslateLoader,
	MissingTranslationHandler,
	FakeMissingTranslationHandler,
	TranslateService,
	TranslatePipe
} from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { routes, NbAuthModule } from '@nebular/auth';
import { NotifyService } from 'app/@core/services/notify/notify.service';
import { DeviceService } from 'app/@core/data/device.service';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { HttpClientModule } from '@angular/common/http';
import { CategoryCreateComponent } from './category-create.component';
import { FileUploaderModule } from 'app/@shared/file-uploader/file-uploader.module';
import { FormsModule } from '@angular/forms';
import { ProductCategoriesFormsModule } from '../forms/product-categories-forms.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { LocaleModule } from '@modules/client.common.angular2/locale/locale.module';
import { ProductsCategoryService } from 'app/@core/data/productsCategory.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const stories = storiesOf('Categories Create Component', module);

export function createApollo(httpLink: HttpLink) {
	return {
		link: httpLink.create({ uri: 'https://api.example.com/graphql' }),
		cache: new InMemoryCache()
	};
}

export const staticTranslateLoader: TranslateLoader = {
	getTranslation(lang: string) {
		return of(require('../../../../../assets/i18n/en.json'));
	}
};

stories.addDecorator(withKnobs);
stories.addDecorator(
	moduleMetadata({
		declarations: [CategoryCreateComponent],
		imports: [
			CommonModule,
			ThemeModule,
			Ng2SmartTableModule,
			NbSpinnerModule,
			ConfirmationModalModule,
			BrowserAnimationsModule,
			ToasterModule.forRoot(),
			TranslateModule.forChild({
				loader: {
					provide: TranslateLoader,
					useValue: staticTranslateLoader
				},
				missingTranslationHandler: {
					provide: MissingTranslationHandler,
					useClass: FakeMissingTranslationHandler
				}
			}),
			RouterModule.forChild(routes),
			NbAuthModule,
			ApolloModule,
			HttpLinkModule,
			PipesModule,
			FileUploaderModule,
			Ng2SmartTableModule,
			NbSpinnerModule,
			FormsModule,
			ProductCategoriesFormsModule,
			LocaleModule,
			HttpClientModule
		],
		providers: [
			DeviceService,
			{
				provide: APOLLO_OPTIONS,
				useFactory: createApollo,
				deps: [HttpLink]
			},
			TranslateStore,
			NotifyService,
			NgbActiveModal,
			ProductLocalesService,
			TranslateService,
			ProductsCategoryService,
			TranslatePipe
		]
	})
);

stories.add('Category Create', () => ({
	component: CategoryCreateComponent,
	props: {
		storybookVersion: boolean('Storybook-Version', true)
	}
}));
