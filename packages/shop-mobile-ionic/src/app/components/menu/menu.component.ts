import { Component, Inject, OnDestroy } from '@angular/core';
import { Store } from 'app/services/store.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { DOCUMENT } from '@angular/common';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MenuController } from '@ionic/angular';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnDestroy {
	merchant: Warehouse;

	private ngDestroy$ = new Subject<void>();

	constructor(
		private store: Store,
		private warehouseRouter: WarehouseRouter,
		@Inject(DOCUMENT) private document: Document,
		private translateService: TranslateService,
		private menuCtrl: MenuController
	) {
		this.translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((event: LangChangeEvent) => {
				console.log(event.lang);
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

	menuOpened() {
		this.loadMerchant();
	}

	private async loadMerchant() {
		if (this.store.inStore) {
			this.merchant = await this.warehouseRouter
				.get(this.store.inStore, false)
				.pipe(first())
				.toPromise();
		} else {
			this.merchant = null;
		}
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
