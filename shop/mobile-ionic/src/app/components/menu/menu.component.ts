import { Component, ElementRef, ɵɵresolveBody } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { environment } from 'environment';
import { Store } from 'app/services/store.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { first } from 'rxjs/operators';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
	merchant: Warehouse;

	private _ourSupportNumber = environment.SUPPORT_NUMBER;
	constructor(
		private store: Store,
		private warehouseRouter: WarehouseRouter,
		private elem: ElementRef
	) {}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	menuOpened() {
		this.loadMerchant();
	}

	async callUs() {
		try {
			await CallNumber.callNumber(this._ourSupportNumber, true);
		} catch (err) {
			// TODO: implement popup notification
			console.error('Call Was Unsuccessful!');
		}
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
	
	ngOnInit() { 
		 let theme =localStorage.getItem('theme');
		this.setTheme(theme);
	}

	getTheme(e) {
		e.preventDefault();
		let themeName = e.detail.value;
		let theme;
		if (themeName === 'night-theme' ) {
			theme = 'night';
			localStorage.setItem('theme', theme);
		} else {
			theme = 'day';
			localStorage.setItem('theme', theme);
		}
		this.setTheme(theme);
	}

	setTheme(theme){
		if(theme === 'night'){
			document.body.classList.add('dark')
		}else{
			document.body.classList.remove('dark')
		}
	}

	getTime() {
		let time = new Date().getSeconds();
		if (time >= 18) {
			document.body.classList.add('dark');
		} else if (time < 18 && time >= 6) {
			document.body.classList.remove('dark');
		}
	}

	autoTheme(e) {
		if (e.detail.checked) {
			setInterval(this.getTime, 1000 * 60 * 60);
		}
	}
}
