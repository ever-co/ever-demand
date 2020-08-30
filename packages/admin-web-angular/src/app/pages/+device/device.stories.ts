import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { DeviceComponent } from './device.component';
import { ThemeModule } from '@app/@theme';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbSpinnerModule } from '@nebular/theme';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { ToasterModule } from 'angular2-toaster';
import { TranslateStore, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { routes, NbAuthModule } from '@nebular/auth';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { DeviceMutationComponent } from './device-mutation/device-mutation.component';
import { DeviceService } from '@app/@core/data/device.service';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { I18nModule } from '@app/@core/utils/i18n.module';

const stories = storiesOf('Device Component', module);

export function createApollo(httpLink: HttpLink) {
	return {
		link: httpLink.create({ uri: 'https://api.example.com/graphql' }),
		cache: new InMemoryCache(),
	};
}

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, '/i18n/', '.json');
}

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
			HttpClientModule,
			I18nModule,
			RouterModule.forChild(routes),
			NbAuthModule,
			ApolloModule,
			PipesModule,
		],
		providers: [
			DeviceService,
			{
				provide: APOLLO_OPTIONS,
				useFactory: createApollo,
				deps: [HttpLink],
			},
			TranslateStore,
			TranslateService,
			NotifyService,
			HttpLink,
		],
	})
);

stories.add('Device', () => ({
	component: DeviceComponent,
	props: {},
}));
