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
	autoThemeChecked: boolean;

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
		const theme = localStorage.getItem('theme');
		this.setTheme(theme);
		if(localStorage.getItem('page_view') === "list"){
			document.getElementById("list").classList.add("item-radio-checked");
			
		}else if(localStorage.getItem('page_view') === "slides"){
			document.getElementById("slides").classList.add("item-radio-checked");
		}
		if(localStorage.getItem("autotheme")=== "true"){
			// document.getElementById("autoThemeToggle").checked = true;
		}
	}

	getTheme(e) {
		e.preventDefault();
		const themeName = e.detail.value;
		let theme;
		if (themeName === 'night-theme') {
			theme = 'night';
		} else {
			theme = 'day';
		}
		if (!this.autoThemeChecked) {
			this.setTheme(theme);
		}
	}

	setTheme(theme) {
		
		if (theme === 'night') {
			localStorage.setItem('theme', theme);
			document.body.classList.add('dark');
			document.getElementById("day").classList.remove('item-radio-checked');
		} else if (theme==="day"){
			localStorage.setItem('theme', theme);
			document.body.classList.remove('dark');
			document.getElementById("night").classList.remove('item-radio-checked');

		}
		if(!theme){
		document.getElementById(theme).classList.add('item-radio-checked');
		}
	}

	getTime() {
		const time = new Date().getHours();
		let theme;
		if (time >= 18) {
			theme = 'night';
		} else if (time < 18 && time >= 6) {
			theme = 'day';
		}
		this.setTheme(theme);
	}

	autoTheme(e) {
		let v =document.getElementById("autoThemeToggle");
		if (e.detail.checked) {
			this.getTime();
			setInterval(this.getTime, 1000 * 60 * 60);
			this.autoThemeChecked = true;
			localStorage.setItem('autotheme', "true");
		} else {
			this.autoThemeChecked = false;
			localStorage.setItem('autotheme', "false");

		}
	}

	changeView(e) {
		
		if (e.detail.value != localStorage.getItem('page_view')) {
			window.location.reload();
		}
		localStorage.setItem('page_view', e.detail.value);
	}
}
