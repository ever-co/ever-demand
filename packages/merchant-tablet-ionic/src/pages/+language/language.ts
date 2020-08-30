import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { Store } from '../../services/store.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'page-language',
	templateUrl: 'language.html',
	styleUrls: ['./language.scss'],
})
export class LanguagePage implements OnInit {
	language: ILanguage;
	dir: 'ltr' | 'rtl';

	OK: string = 'OK';
	CANCEL: string = 'CANCEL';
	PREFIX: string = 'LANGUAGE_VIEW.';
	selected: string;

	constructor(
		public translate: TranslateService,
		private _deviceRouter: DeviceRouter,
		private store: Store,
		@Inject(DOCUMENT) private document: Document
	) {}

	ngOnInit() {
		this.selected = localStorage.getItem('_language');
		this.language = localStorage.getItem('_language') as ILanguage;
		// TODO: use settings service to get list of supported languages
		this.translate.addLangs(['en-US', 'bg-BG', 'he-IL', 'ru-RU', 'es-ES']);
	}

	get buttonOK() {
		return this._translate(this.PREFIX + this.OK);
	}

	get buttonCancel() {
		return this._translate(this.PREFIX + this.CANCEL);
	}

	switchLanguage(language: string) {
		this._deviceRouter.updateLanguage(
			localStorage.getItem('_deviceId'),
			this.language
		);
		this.store.language = language;
		this.translate.use(language);

		const currentLang = localStorage.getItem('_language');

		const langAbbreviation = currentLang.substr(0, 2);

		if (currentLang === 'he-IL') {
			this.dir = 'rtl';
		} else {
			this.dir = 'ltr';
		}
		this.document.documentElement.dir = this.dir;
		this.document.documentElement.lang = langAbbreviation;
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translate.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}
}
