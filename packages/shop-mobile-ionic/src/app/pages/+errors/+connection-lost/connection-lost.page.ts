import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
	selector: 'e-cu-connection-lost',
	templateUrl: './connection-lost.page.html',
	styleUrls: ['./connection-lost.page.scss'],
})
export class ConnectionLostPage implements OnInit {
	noInternetLogo: string;
	companyName: string;
	constructor() {
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		this.companyName = environment.COMPANY_NAME;
	}

	ngOnInit() {}
}
