import { Component, OnDestroy } from '@angular/core';
import { Store } from 'services/store.service';
import { Platform, MenuController } from '@ionic/angular';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnDestroy {
	companyName: string;

	private ngDestroy$ = new Subject<void>();

	constructor(
		private store: Store,
		public platform: Platform,
		private translateService: TranslateService,
		private menuCtrl: MenuController
	) {
		this.companyName = environment.APP_NAME;
		this.translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((event: LangChangeEvent) => {
				if (event.lang === 'he') {
					this.menuCtrl.enable(true, 'rtl');
					this.menuCtrl.enable(false, 'ltr');
				} else {
					this.menuCtrl.enable(true, 'ltr');
					this.menuCtrl.enable(false, 'rtl');
				}
			});
	}

	get showInformationPage() {
		return this.store.showInformationPage;
	}

	menuOpened() {}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
