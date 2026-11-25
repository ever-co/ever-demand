import {
	Component,
	Inject,
	OnInit,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppState } from './app.service';
import { TranslateService } from '@ngx-translate/core';
import { Store } from './services/store';
import {
	getBrowserLanguage,
	SUPPORTED_LANGUAGES,
} from './services/browser-language';

export interface ToolbarController {
	toolbarDisabled: boolean;
}

export const ROOT_SELECTOR = 'app';

/**
 * App Component
 * Top Level Component
 */
@Component({
	standalone: false,
	selector: 'app',
	encapsulation: ViewEncapsulation.None,
	styles: [
		`
			html,
			body,
			app,
			mat-sidenav-container {
				margin: 0;
				width: 100%;
				height: 100%;
				background-color: #eeeeee;
			}

			.app-content {
				width: 100%;
				height: 100%;
				background-color: #eeeeee;
			}

			.app-content.toolbar-enabled {
				padding-top: 64px;
				height: 100%;
			}
		`,
	],
	template: `
		<toolbar *ngIf="!isToolbarDisabled"></toolbar>
		<div
			class="app-content"
			[ngClass]="{ 'toolbar-enabled': !isToolbarDisabled }"
		>
			<router-outlet></router-outlet>
		</div>
	`,
})
export class AppComponent implements OnInit {
	@ViewChild(RouterOutlet)
	public routerOutlet: RouterOutlet;

	constructor(
		public appState: AppState,
		private translateService: TranslateService,
		private store: Store,
		@Inject(DOCUMENT) private document: Document
	) {
		// Here we initialize translates for the all app, when loads for the first time. Do not remove it

		const current = translateService.getCurrentLang();

		if (current) {
			translateService.setFallbackLang(current);
		} else {
			// TODO: load list of supported languages from config service
			translateService.addLangs(SUPPORTED_LANGUAGES);

			translateService.setFallbackLang('en-US');

			const language = getBrowserLanguage(translateService);
			translateService.use(language);

			// Same as Settings > switchLanguage: Hebrew reads right to left
			this.document.documentElement.dir =
				language === 'he-IL' ? 'rtl' : 'ltr';
			this.document.documentElement.lang = language.substring(0, 2);
		}
	}

	public get isToolbarDisabled() {
		const serverConnection = Number(this.store.serverConnection);
		return (
			this.routerOutlet == null ||
			serverConnection === 0 ||
			!this.routerOutlet.isActivated ||
			(this.routerOutlet.component as ToolbarController)
				.toolbarDisabled === true
		);
	}

	ngOnInit() {
		console.log('Initial App State', this.appState.state);
	}
}
