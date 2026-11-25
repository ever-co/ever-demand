import {
	Component,
	OnDestroy,
	OnInit,
	Inject,
	ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { DOCUMENT } from '@angular/common';
import {
	getBrowserLanguage,
	SUPPORTED_LANGUAGES,
} from '../services/browser-language';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'settings',
	styleUrls: ['./settings.component.scss'],
	templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
	public selectedLang: string;
	public defaultLanguage = '';
	public dir: 'ltr' | 'rtl';

	constructor(
		public readonly translateService: TranslateService,
		@Inject(DOCUMENT) public document: Document
	) {
		this.defaultLanguage = environment['DEFAULT_LANGUAGE'];

		const current = translateService.getCurrentLang();

		if (current) {
			this.selectedLang = current;
			translateService.setFallbackLang(current);
		} else {
			// TODO: load list of supported languages from config service
			translateService.addLangs(SUPPORTED_LANGUAGES);

			translateService.setFallbackLang('en-US');

			if (this.defaultLanguage) {
				translateService.use(this.defaultLanguage);
			} else {
				translateService.use(getBrowserLanguage(translateService));
			}

			this.selectedLang = this.translateService.getCurrentLang();
		}
	}

	ngOnInit() {}

	switchLanguage(language: string) {
		this.translateService.use(language);

		const langAbbreviation = language.substring(0, 2);

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
