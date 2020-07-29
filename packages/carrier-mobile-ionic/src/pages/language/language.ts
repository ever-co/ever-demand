import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'page-language',
	templateUrl: 'language.html',
	styleUrls: ['language.scss'],
})
export class LanguagePage {
	language: any = localStorage.getItem('_language');
	dir: 'ltr' | 'rtl';

	constructor(
		private _langTranslator: TranslateService,
		private _deviceRouter: DeviceRouter,
		@Inject(DOCUMENT) private document: Document
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

		if (this.language === 'he-IL') {
			this.dir = 'rtl';
		} else {
			this.dir = 'ltr';
		}
		this.document.documentElement.dir = this.dir;
		this.document.documentElement.lang = langAbbreviation;
	}
}
