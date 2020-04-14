import { storiesOf, moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ThemeModule } from '@app/@theme';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbSpinnerModule } from '@nebular/theme';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { ToasterModule } from 'angular2-toaster';
import { TranslateLoader } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { routes, NbAuthModule } from '@nebular/auth';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { DeviceService } from '@app/@core/data/device.service';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { HttpClientModule } from '@angular/common/http';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocaleModule } from '@modules/client.common.angular2/locale/locale.module';
import { ProductsCategoryService } from '@app/@core/data/productsCategory.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CategoriesTableComponent } from './categories-table.component';
import { I18nModule } from '@app/@core/utils/i18n.module';

const stories = storiesOf('Categories Table Component', module);

export function createApollo(httpLink: HttpLink) {
	return {
		link: httpLink.create({ uri: 'https://api.example.com/graphql' }),
		cache: new InMemoryCache(),
	};
}

export const staticTranslateLoader: TranslateLoader = {
	getTranslation(lang: string) {
		return of(require('../../../../../assets/i18n/en.json'));
	},
};

stories.addDecorator(withKnobs);

stories.addDecorator(
	moduleMetadata({
		declarations: [],
		imports: [
			CommonModule,
			ThemeModule,
			Ng2SmartTableModule,
			NbSpinnerModule,
			ConfirmationModalModule,
			BrowserAnimationsModule,
			ToasterModule.forRoot(),
			RouterModule.forChild(routes),
			NbAuthModule,
			ApolloModule,
			HttpLinkModule,
			PipesModule,
			FileUploaderModule,
			Ng2SmartTableModule,
			NbSpinnerModule,
			FormsModule,
			LocaleModule,
			HttpClientModule,
			I18nModule,
		],
		providers: [
			DeviceService,
			{
				provide: APOLLO_OPTIONS,
				useFactory: createApollo,
				deps: [HttpLink],
			},
			NotifyService,
			NgbActiveModal,
			ProductsCategoryService,
		],
	})
);

stories.add('Category Table', () => ({
	component: CategoriesTableComponent,
	props: {
		storybookVersion: boolean('Storybook-Version', true),
	},
}));
