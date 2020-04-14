import { Component, Input, ViewChild } from '@angular/core';
import { NbPopoverDirective, NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';
import { ThemeSwitcherListComponent } from './themes-switcher-list/themes-switcher-list.component';
import { AnalyticsService } from '@app/@core/utils/analytics.service';

@Component({
	selector: 'ngx-theme-switcher',
	templateUrl: './theme-switcher.component.html',
	styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent {
	@ViewChild(NbPopoverDirective, { static: true })
	popover: NbPopoverDirective;

	@Input()
	showTitle: boolean = true;

	switcherListComponent = ThemeSwitcherListComponent;
	theme: NbJSThemeOptions;

	constructor(
		private themeService: NbThemeService,
		private analyticsService: AnalyticsService
	) {
		this.themeService.onThemeChange().subscribe((theme: any) => {
			this.activeTheme = theme.name;
		});

		this.activeTheme = themeService.currentTheme;
	}
	activeTheme: string;
}
