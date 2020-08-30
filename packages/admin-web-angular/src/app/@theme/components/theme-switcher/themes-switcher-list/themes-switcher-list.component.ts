import { Component, Input } from '@angular/core';
import { NbPopoverDirective, NbThemeService } from '@nebular/theme';
import { AnalyticsService } from '../../../../@core/utils/analytics.service';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';

@Component({
	selector: 'ngx-theme-switcher-list',
	templateUrl: './theme-switcher-list.component.html',
	styleUrls: ['./theme-switcher-list.component.scss'],
})
export class ThemeSwitcherListComponent {
	@Input() popover: NbPopoverDirective;

	theme: NbJSThemeOptions;

	themes = [
		{
			title: 'Light',
			key: 'everlight',
		},
		{
			title: 'Dark',
			key: 'everdark',
		},
		{
			title: 'White',
			key: 'default',
		},
		{
			title: 'Cosmic',
			key: 'cosmic',
		},
		{
			title: 'Corporate',
			key: 'corporate',
		},
	];

	constructor(
		private themeService: NbThemeService,
		private analyticsService: AnalyticsService
	) {}
	onToggleTheme(themeKey: string) {
		this.themeService.changeTheme(themeKey);
		this.analyticsService.trackEvent('switchTheme');
		this.popover.hide();
	}
}
