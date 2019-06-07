import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
	NbActionsModule,
	NbCardModule,
	NbLayoutModule,
	NbMenuModule,
	NbRouteTabsetModule,
	NbSearchModule,
	NbSidebarModule,
	NbTabsetModule,
	NbThemeModule,
	NbUserModule,
	NbCheckboxModule,
	NbPopoverModule,
	NbContextMenuModule,
	NbProgressBarModule
} from '@nebular/theme';

import { NbSecurityModule } from '@nebular/security';

import {
	FooterComponent,
	HeaderComponent,
	LayoutDirectionSwitcherComponent,
	SearchInputComponent,
	SwitcherComponent,
	ThemeSettingsComponent,
	ThemeSwitcherComponent,
	ThemeSwitcherListComponent,
	TinyMCEComponent
} from './components';

import {
	OneColumnLayoutComponent,
	SampleLayoutComponent,
	ThreeColumnsLayoutComponent,
	TwoColumnsLayoutComponent
} from './layouts';

import { DEFAULT_THEME } from './styles/theme.default';
import { COSMIC_THEME } from './styles/theme.cosmic';
import { CORPORATE_THEME } from './styles/theme.corporate';
import { EVERDARK_THEME } from './styles/theme.everdark';
import { EVERLIGHT_THEME } from './styles/theme.everlight';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdminsService } from '../@core/data/admins.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { NbEvaIconsModule } from '@nebular/eva-icons';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const BASE_MODULES = [CommonModule, FormsModule, ReactiveFormsModule];

const NB_MODULES = [
	NbCardModule,
	NbLayoutModule,
	NbTabsetModule,
	NbRouteTabsetModule,
	NbMenuModule,
	NbUserModule,
	NbActionsModule,
	NbSearchModule,
	NbSidebarModule,
	NbCheckboxModule,
	NbPopoverModule,
	NbContextMenuModule,
	NgbModule,
	NbSecurityModule, // *nbIsGranted directive
	NbProgressBarModule
];

const COMPONENTS = [
	SwitcherComponent,
	LayoutDirectionSwitcherComponent,
	ThemeSwitcherComponent,
	ThemeSwitcherListComponent,
	HeaderComponent,
	FooterComponent,
	SearchInputComponent,
	ThemeSettingsComponent,
	TinyMCEComponent,
	OneColumnLayoutComponent,
	SampleLayoutComponent,
	ThreeColumnsLayoutComponent,
	TwoColumnsLayoutComponent
];

const ENTRY_COMPONENTS = [ThemeSwitcherListComponent];

const NB_THEME_PROVIDERS = [
	...NbThemeModule.forRoot(
		{
			name: 'everlight'
		},
		[
			DEFAULT_THEME,
			COSMIC_THEME,
			CORPORATE_THEME,
			EVERDARK_THEME,
			EVERLIGHT_THEME
		]
	).providers,
	...NbSidebarModule.forRoot().providers,
	...NbMenuModule.forRoot().providers,
	AdminsService
];

@NgModule({
	imports: [
		...BASE_MODULES,
		...NB_MODULES,
		NbEvaIconsModule,
		HttpClientModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		PipesModule
	],
	exports: [...BASE_MODULES, ...NB_MODULES, ...COMPONENTS],
	declarations: [...COMPONENTS],
	entryComponents: [...ENTRY_COMPONENTS]
})
export class ThemeModule {
	static forRoot(): ModuleWithProviders {
		const providers: ModuleWithProviders = {
			ngModule: ThemeModule,
			providers: [...NB_THEME_PROVIDERS]
		};

		return providers;
	}
}
