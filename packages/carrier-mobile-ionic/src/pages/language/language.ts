import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';

@Component({
	selector: 'page-language',
	templateUrl: 'language.html',
	styleUrls: ['language.scss'],
})
export class LanguagePage {
	language: any = localStorage.getItem('_language');

	constructor(
		private _langTranslator: TranslateService,
		private _deviceRouter: DeviceRouter
	) {
		console.warn('LanguagePage loaded');
	}

	get deviceId() {
		return localStorage.getItem('_deviceId');
	}

	languageChange() {
		localStorage.setItem('_language', this.language);

		// Example: "en-US".substr(0, 2) = "en"
		const langAbbreviation = this.language.substr(0, 2);

		this._langTranslator.use(langAbbreviation);

		if (this.deviceId) {
			this._deviceRouter.updateLanguage(this.deviceId, this.language);
		}
	}
}
