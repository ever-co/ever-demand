import { Component, OnDestroy } from '@angular/core';
import { delay, takeWhile, withLatestFrom } from 'rxjs/operators';
import {
	NbMediaBreakpoint,
	NbMediaBreakpointsService,
	NbMenuItem,
	NbMenuService,
	NbSidebarService,
	NbThemeService,
} from '@nebular/theme';

import { StateService } from '../../../@core/data/state.service';

// TODO: move layouts into the framework
@Component({
	selector: 'ngx-sample-layout',
	styleUrls: ['./sample.layout.scss'],
	templateUrl: 'sample.layout.html',
})
export class SampleLayoutComponent implements OnDestroy {
	subMenu: NbMenuItem[] = [
		{
			title: 'PAGE LEVEL MENU',
			group: true,
		},
		{
			title: 'Buttons',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/buttons',
		},
		{
			title: 'Grid',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/grid',
		},
		{
			title: 'Icons',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/icons',
		},
		{
			title: 'Modals',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/modals',
		},
		{
			title: 'Typography',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/typography',
		},
		{
			title: 'Animated Searches',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/search-fields',
		},
		{
			title: 'Tabs',
			icon: 'ion ion-android-radio-button-off',
			link: '/ui-features/tabs',
		},
	];
	layout: any = {};
	sidebar: any = {};

	private alive = true;

	currentTheme: string;

	constructor(
		protected stateService: StateService,
		protected menuService: NbMenuService,
		protected themeService: NbThemeService,
		protected bpService: NbMediaBreakpointsService,
		protected sidebarService: NbSidebarService
	) {
		this.stateService
			.onLayoutState()
			.pipe(takeWhile(() => this.alive))
			.subscribe((layout: string) => (this.layout = layout));

		this.stateService
			.onSidebarState()
			.pipe(takeWhile(() => this.alive))
			.subscribe((sidebar: string) => {
				this.sidebar = sidebar;
			});

		const isBp = this.bpService.getByName('is');
		this.menuService
			.onItemSelect()
			.pipe(
				takeWhile(() => this.alive),
				withLatestFrom(this.themeService.onMediaQueryChange()),
				delay(20)
			)
			.subscribe(
				([item, [bpFrom, bpTo]]: [
					any,
					[NbMediaBreakpoint, NbMediaBreakpoint]
				]) => {
					if (bpTo.width <= isBp.width) {
						this.sidebarService.collapse('menu-sidebar');
					}
				}
			);

		this.themeService
			.getJsTheme()
			.pipe(takeWhile(() => this.alive))
			.subscribe((theme) => {
				this.currentTheme = theme.name;
			});
	}

	ngOnDestroy() {
		this.alive = false;
	}
}
