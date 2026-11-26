import {
	ChangeDetectionStrategy,
	Component,
	Inject,
} from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { Store } from '../../services/store.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-language',
	templateUrl: './language.page.html',
	styleUrls: ['./language.page.scss'],
})
export class LanguagePage {
	dir: 'ltr' | 'rtl';

	constructor(
		private readonly store: Store,
		private readonly deviceRouter: DeviceRouter,
		private location: Location,
		public translate: TranslateService,
		@Inject(DOCUMENT) public document: Document,
		public platform: Platform
	) {}

	set language(lang: ILanguage) {
		this.store.language = lang;
		void this._saveDeviceLanguage(lang);

		const currentLang = this.store.language;

		const langAbbreviation = currentLang.slice(0, 2);
		if (currentLang === 'he-IL') {
			this.dir = 'rtl';
		} else {
			this.dir = 'ltr';
		}
		this.document.documentElement.dir = this.dir;
		this.document.documentElement.lang = langAbbreviation;

		this.goBack();
	}

	get language(): ILanguage {
		return this.store.language;
	}

	goBack() {
		this.location.back();
	}

	// The server device gets a language only when it is first registered.
	// Save the pick on it, so the texts and pushes the server sends are in
	// that language too. The app switches language whatever the answer.
	private async _saveDeviceLanguage(language: ILanguage) {
		const deviceId = this.store.deviceId;
		if (!deviceId) {
			return;
		}

		try {
			await this.deviceRouter.updateLanguage(deviceId, language);
		} catch (error) {
			console.error('Could not save the language on the device', error);
		}
	}
}
