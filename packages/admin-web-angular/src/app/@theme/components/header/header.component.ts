import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService, NbMenuItem } from '@nebular/theme';
import { Subject, Observable } from 'rxjs';
import { AdminsService } from '../../../@core/data/admins.service';
import { Store } from '../../../@core/data/store.service';
import Admin from '@modules/server.common/entities/Admin';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ngx-header',
	styleUrls: ['./header.component.scss'],
	templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
	@Input()
	position = 'normal';

	admin$: Observable<Admin>;

	adminMenu: NbMenuItem[];

	private ngDestroy$ = new Subject<void>();

	constructor(
		private sidebarService: NbSidebarService,
		private menuService: NbMenuService,
		private adminsService: AdminsService,
		private store: Store,
		private translateService: TranslateService
	) {
		this.initialize();
		this._applyTranslationOnSmartTable();
		this.admin$ = this.adminsService.getAdmin(this.store.adminId);
	}

	ngOnInit() {}

	initialize() {
		this.adminMenu = [
			{
				title: this.getTranslation('HEADER_VIEW.PROFILE'),
				link: '/profile',
			},
			{
				title: this.getTranslation('HEADER_VIEW.LOG_OUT'),
				link: '/auth/logout',
			},
		];
	}

	getTranslation(prefix: string) {
		let result = '';
		this.translateService.get(prefix).subscribe((res) => {
			result = res;
		});
		return result;
	}

	private _applyTranslationOnSmartTable() {
		this.translateService.onLangChange.subscribe(() => {
			this.initialize();
		});
	}

	toggleSidebar(): boolean {
		this.sidebarService.toggle(true, 'menu-sidebar');
		return false;
	}

	toggleSettings(): boolean {
		this.sidebarService.toggle(false, 'settings-sidebar');
		return false;
	}

	navigateHome() {
		this.menuService.navigateHome();
	}

	startSearch() {
		return false;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
