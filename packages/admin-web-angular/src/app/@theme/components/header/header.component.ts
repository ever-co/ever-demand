import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { NbMenuService, NbSidebarService, NbMenuItem } from '@nebular/theme';
import { Subject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminsService } from '../../../@core/data/admins.service';
import { Store } from '../../../@core/data/store.service';
import Admin from '@modules/server.common/entities/Admin';
import { TranslateService } from '@ngx-translate/core';
import { AdminSessionService } from '../../../@core/tenant/admin-session.service';

@Component({
	standalone: false,
	selector: 'ngx-header',
	styleUrls: ['./header.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
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
		private translateService: TranslateService,
		private readonly session: AdminSessionService,
	) {
		this.initialize();
		this._applyTranslationOnSmartTable();
		this.admin$ = this.adminsService
			.getAdmin(this.store.adminId)
			// keeps the role and super-admin flag of the screens up to date
			.pipe(tap((admin) => this.session.refresh(admin as any)));
	}

	/** Platform super-admins get the tenant switcher. */
	get isSuperAdmin(): boolean {
		return this.session.isSuperAdmin;
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
