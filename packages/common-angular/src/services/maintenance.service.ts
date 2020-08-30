import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first } from 'rxjs/operators';

export interface IMaintenanceInfo {
	type: MaintenanceTypes | string;
	status: boolean;
	message: string;
}

export enum MaintenanceTypes {
	ShopMobile = 'shop-mobile',
	ShopWeb = 'shop-web',
	CarrierMobile = 'carrier-mobile',
	MerchantTablet = 'merchant-tablet',
	Admin = 'admin',
	Api = 'api',
}

@Injectable()
export class MaintenanceService {
	private headers: HttpHeaders = new HttpHeaders({
		'Content-Type': 'application/json',
	});
	constructor(private http: HttpClient) {}

	async getMaintenanceInfo(
		maintenanceApiUrl: string
	): Promise<IMaintenanceInfo[]> {
		const maintenanceInfo = await this.http
			.get(maintenanceApiUrl, {
				headers: this.headers,
			})
			.pipe(first())
			.toPromise();
		return maintenanceInfo['maintenance'];
	}

	load(appTyle: string, maintenanceApiUrl: string) {
		return new Promise(async (resolve, reject) => {
			try {
				const maintenanceInfo = await this.getMaintenanceInfo(
					maintenanceApiUrl
				);
				const apiInfo = await maintenanceInfo.find(
					(m: IMaintenanceInfo) =>
						m.type === MaintenanceTypes.Api && m.status
				);
				const appInfo = maintenanceInfo.find(
					(m: IMaintenanceInfo) => m.type === appTyle && m.status
				);
				const maintenanceMode: IMaintenanceInfo = apiInfo || appInfo;
				if (maintenanceMode) {
					localStorage.setItem(
						'maintenanceMode',
						maintenanceMode.type
					);
				} else {
					localStorage.removeItem('maintenanceMode');
				}
				resolve(true);
			} catch (error) {
				localStorage.removeItem('maintenanceMode');
				resolve(true);
			}
		});
	}

	async getMessage(type: string, maintenanceApiUrl: string) {
		try {
			const maintenanceInfo = await this.getMaintenanceInfo(
				maintenanceApiUrl
			);
			return maintenanceInfo.find(
				(m: IMaintenanceInfo) => m.type === type
			).message;
		} catch (error) {}
	}

	async getStatus(type: string, maintenanceApiUrl: string): Promise<boolean> {
		try {
			const maintenanceInfo = await this.getMaintenanceInfo(
				maintenanceApiUrl
			);
			const apiStatus = maintenanceInfo.find(
				(m: IMaintenanceInfo) => m.type === MaintenanceTypes.Api
			).status;
			const appStatus = maintenanceInfo.find(
				(m: IMaintenanceInfo) => m.type === type
			).status;
			return apiStatus && appStatus;
		} catch (error) {}
	}
}
