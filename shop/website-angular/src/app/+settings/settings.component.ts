import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'settings',
	styleUrls: ['./settings.component.scss'],
	templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
	public selectedLang: string;
	constructor(private translateService: TranslateService) {
		if (translateService.currentLang) {
			const current = translateService.currentLang;
			this.selectedLang = current;
			translateService.setDefaultLang(current);
		} else {
			// TODO: load list of supported languages from config service
			translateService.addLangs(['en', 'es', 'bg', 'he', 'ru']);
			translateService.setDefaultLang('en');

			const browserLang = translateService.getBrowserLang();
			// TODO: load list of supported languages from config service
			translateService.use(
				browserLang.match(/en|es|bg|he|ru/) ? browserLang : 'en'
			);
			this.selectedLang = this.translateService.currentLang;
		}
	}

	ngOnInit() {}

	switchLanguage(language: string) {
		this.translateService.use(language);
	}

	ngOnDestroy() {}
}
