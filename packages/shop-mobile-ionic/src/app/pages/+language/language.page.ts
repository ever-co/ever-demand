import { Component, Inject } from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { Store } from '../../services/store.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';

@Component({
	selector: 'e-cu-language',
	templateUrl: './language.page.html',
	styleUrls: ['./language.page.scss'],
})
export class LanguagePage {
	dir: 'ltr' | 'rtl';

	constructor(
		private readonly store: Store,
		private location: Location,
		public translate: TranslateService,
		@Inject(DOCUMENT) public document: Document,
		public platform: Platform
	) {}

	set language(lang: ILanguage) {
		this.store.language = lang;

		const currentLang = this.store.language;

		const langAbbreviation = currentLang.substr(0, 2);
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
}
