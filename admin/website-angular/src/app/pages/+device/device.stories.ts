import { storiesOf, moduleMetadata } from '@storybook/angular';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { of } from 'rxjs';
import {
	text,
	optionsKnob as options,
	withKnobs,
	boolean
} from '@storybook/addon-knobs';
import { action, configureActions } from '@storybook/addon-actions';
import { DeviceComponent } from './device.component';
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
	FakeMissingTranslationHandler
} from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { routes, NbAuthModule } from '@nebular/auth';
import { NotifyService } from 'app/@core/services/notify/notify.service';
import { DeviceMutationComponent } from './device-mutation/device-mutation.component';
import { DeviceModule } from './device.module';
import { DeviceService } from 'app/@core/data/device.service';
import { Apollo, ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

const stories = storiesOf('Device Component', module);

export function createApollo(httpLink: HttpLink) {
	return {
		link: httpLink.create({ uri: 'https://api.example.com/graphql' }),
		cache: new InMemoryCache()
	};
}

export const staticTranslateLoader: TranslateLoader = {
	getTranslation(lang: string) {
		return of(require('assets/i18n/en.json'));
	}
};

stories.addDecorator(withKnobs);
stories.addDecorator(
	moduleMetadata({
		declarations: [DeviceComponent, DeviceMutationComponent],
		imports: [
			CommonModule,
			ThemeModule,
			Ng2SmartTableModule,
			NbSpinnerModule,
			ConfirmationModalModule,
			ToasterModule.forRoot(),
			TranslateModule.forRoot({
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
			PipesModule
		],
		providers: [
			DeviceService,
			{
				provide: APOLLO_OPTIONS,
				useFactory: createApollo,
				deps: [HttpLink]
			},
			TranslateStore,
			NotifyService
		]
	})
);
stories.add('Device', () => ({
	component: DeviceComponent,
	props: {}
}));
