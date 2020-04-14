import { Component } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { NbMenuItem } from '@nebular/theme';

@Component({
	selector: 'ea-pages',
	templateUrl: './pages.component.html',
})
export class PagesComponent {
	menu: NbMenuItem[];

	constructor(private translate: TranslateService) {
		this.initialize();
		this._applyTranslationOnSmartTable();
	}

	initialize() {
		this.menu = [
			{
				title: this.getTranslation('MENU_VIEW.DASHBOARD'),
				icon: 'pie-chart-outline',
				link: '/dashboard',
				pathMatch: 'prefix',
			},
			{
				title: this.getTranslation('MENU_VIEW.STORES'),
				icon: 'home-outline',
				link: '/stores',
				pathMatch: 'prefix',
			},
			{
				title: this.getTranslation('MENU_VIEW.PRODUCTS.PRODUCTS'),
				icon: 'shopping-cart-outline',
				link: '/products',
				children: [
					{
						title: this.getTranslation(
							'MENU_VIEW.PRODUCTS.MANAGEMENT'
						),
						link: '/products/list',
					},
					{
						title: this.getTranslation(
							'MENU_VIEW.PRODUCTS.CATEGORIES'
						),
						link: '/products/categories',
						pathMatch: 'prefix',
					},
				],
			},
			{
				title: this.getTranslation('MENU_VIEW.CUSTOMERS.CUSTOMERS'),
				icon: 'person-outline',
				link: '/customers',
				children: [
					{
						title: this.getTranslation(
							'MENU_VIEW.CUSTOMERS.MANAGEMENT'
						),
						link: '/customers/list',
					},
					{
						title: this.getTranslation(
							'MENU_VIEW.CUSTOMERS.INVITES'
						),
						link: '/customers/invites',
						pathMatch: 'prefix',
					},
				],
			},
			{
				title: this.getTranslation('MENU_VIEW.CARRIERS'),
				icon: 'car-outline',
				link: '/carriers',
				pathMatch: 'prefix',
			},
			{
				title: this.getTranslation('MENU_VIEW.SIMULATION'),
				icon: 'star-outline',
				link: '/simulation',
				pathMatch: 'prefix',
				home: true,
			},
			{
				title: this.getTranslation('MENU_VIEW.SETUP'),
				icon: 'settings-2-outline',
				link: '/setup',
				pathMatch: 'prefix',
			},
		];
	}

	getTranslation(prefix: string) {
		let result = '';
		this.translate.get(prefix).subscribe((res) => {
			result = res;
		});
		return result;
	}

	private _applyTranslationOnSmartTable() {
		this.translate.onLangChange.subscribe(() => {
			this.initialize();
		});
	}
}
