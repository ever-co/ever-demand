import { Component } from '@angular/core';
import { StateService } from '../../../@core/data/state.service';
import { TranslateService } from '@ngx-translate/core';
import { NbThemeService } from '@nebular/theme';

@Component({
	selector: 'ngx-theme-settings',
	styleUrls: ['./theme-settings.component.scss'],
	templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
	layouts = [];
	sidebars = [];

	languages = { en: 'English', bg: 'Bulgarian', he: 'Hebrew', ru: 'Russian' };

	themes = [
		{
			value: 'everlight',
			name: 'Ever Light'
		},
		{
			value: 'everdark',
			name: 'Ever Dark'
		},
		{
			value: 'default',
			name: 'White'
		},
		{
			value: 'cosmic',
			name: 'Cosmic'
		},
		{
			value: 'corporate',
			name: 'Corporate'
		},
		{
			value: 'dark',
			name: 'Dark'
		}
	];

	currentTheme = 'everlight';

	constructor(
		protected stateService: StateService,
		public translate: TranslateService,
		private themeService: NbThemeService
	) {
		translate.addLangs(['en', 'bg', 'he', 'ru']);
		translate.setDefaultLang('en');

		const browserLang = translate.getBrowserLang();
		translate.use(browserLang.match(/en|bg|he|ru/) ? browserLang : 'en');

		this.stateService
			.getLayoutStates()
			.subscribe((layouts: any[]) => (this.layouts = layouts));

		this.stateService
			.getSidebarStates()
			.subscribe((sidebars: any[]) => (this.sidebars = sidebars));
	}

	toggleTheme() {
		this.themeService.changeTheme(this.currentTheme);
	}

	switchLanguage(language: string) {
		if (language === 'he') {
			this.stateService.setSidebarState(this.sidebars[1]);
		} else {
			this.stateService.setSidebarState(this.sidebars[0]);
		}

		this.translate.use(language);
	}

	layoutSelect(layout: any): boolean {
		this.layouts = this.layouts.map((l: any) => {
			l.selected = false;
			return l;
		});

		layout.selected = true;
		this.stateService.setLayoutState(layout);
		return false;
	}

	sidebarSelect(sidebars: any): boolean {
		this.sidebars = this.sidebars.map((s: any) => {
			s.selected = false;
			return s;
		});

		sidebars.selected = true;
		this.stateService.setSidebarState(sidebars);
		return false;
	}
}
