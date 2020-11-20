import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'settings',
	styleUrls: ['./settings.component.scss'],
	templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
	public selectedLang: string;
	public defaultLanguage = '';
	public dir: 'ltr' | 'rtl';

	constructor(
		private translateService: TranslateService,
		@Inject(DOCUMENT) public document: Document
	) {
		this.defaultLanguage = environment['DEFAULT_LANGUAGE'];

		if (translateService.currentLang) {
			const current = translateService.currentLang;
			this.selectedLang = current;
			translateService.setDefaultLang(current);
		} else {
			// TODO: load list of supported languages from config service
			translateService.addLangs([
				'en-US',
				'es-ES',
				'bg-BG',
				'he-IL',
				'ru-RU',
			]);

			translateService.setDefaultLang('en-US');

			const browserLang = translateService.getBrowserLang();
			// TODO: load list of supported languages from config service

			if (this.defaultLanguage) {
				translateService.use(this.defaultLanguage);
			} else {
				browserLang.match(/en-US|es-ES|bg-BG|he-IL|ru-RU/)
					? browserLang
					: 'en-US';
			}

			this.selectedLang = this.translateService.currentLang;
		}
	}

	ngOnInit() {}

	switchLanguage(language: string) {
		this.translateService.use(language);

		const langAbbreviation = language.substr(0, 2);

		if (language === 'he-IL') {
			this.dir = 'rtl';
		} else {
			this.dir = 'ltr';
		}
		this.document.documentElement.dir = this.dir;
		this.document.documentElement.lang = langAbbreviation;
	}

	ngOnDestroy() {}
}
