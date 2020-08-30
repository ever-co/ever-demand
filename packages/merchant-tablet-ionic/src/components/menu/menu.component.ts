import { Component, OnDestroy } from '@angular/core';
import { Store } from 'services/store.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnDestroy {
	private ngDestroy$ = new Subject<void>();

	constructor(
		private store: Store,
		private menuCtrl: MenuController,
		private translateService: TranslateService
	) {
		this.translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((event: LangChangeEvent) => {
				if (event.lang === 'he-IL') {
					this.menuCtrl.enable(true, 'rtl');
					this.menuCtrl.enable(false, 'ltr');
				} else {
					this.menuCtrl.enable(true, 'ltr');
					this.menuCtrl.enable(false, 'rtl');
				}
			});
	}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	menuOpened() {}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
