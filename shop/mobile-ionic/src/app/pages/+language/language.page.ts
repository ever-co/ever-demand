import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '../../services/store.service';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'e-cu-language',
	templateUrl: './language.page.html',
	styleUrls: ['./language.page.scss']
})
export class LanguagePage {
	constructor(
		private readonly store: Store,
		private location: Location,
		public translate: TranslateService
	) {}

	set language(lang: ILanguage) {
		this.store.language = lang;
		this.location.back();
	}

	get language(): ILanguage {
		return this.store.language;
	}

	goBack() {
		this.location.back();
	}

	// TODO: not sure it's needed, before we just call 'set language` using [(ngModel)]="language"
	switchLanguage(language: string) {
		this.translate.use(language);
	}
}
