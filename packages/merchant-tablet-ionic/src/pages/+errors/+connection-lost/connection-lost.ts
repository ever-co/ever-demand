import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'page-connection-lost',
	templateUrl: 'connection-lost.html',
	styleUrls: ['./connection-lost.scss'],
})
export class ConnectionLostPage {
	noInternetLogo: string;
	companyName: string;

	constructor() {
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		this.companyName = environment.COMPANY_NAME;
	}
}
