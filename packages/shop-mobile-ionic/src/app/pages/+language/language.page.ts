import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '../../services/store.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'e-cu-language',
	templateUrl: './language.page.html',
	styleUrls: ['./language.page.scss'],
})
export class LanguagePage {
	constructor(
		private readonly store: Store,
		private location: Location,
		public translate: TranslateService
	) {}

	set language(lang: ILanguage) {
		this.store.language = lang;
		this.goBack();
	}

	get language(): ILanguage {
		return this.store.language;
	}

	goBack() {
		this.location.back();
	}
}
