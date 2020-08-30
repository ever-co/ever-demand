import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators/takeWhile';

// TODO: move layouts into the framework
@Component({
	selector: 'ngx-three-columns-layout',
	styleUrls: ['./three-columns.layout.scss'],
	templateUrl: './three-columns.layout.html',
})
export class ThreeColumnsLayoutComponent implements OnDestroy {
	private alive = true;

	currentTheme: string;

	constructor(protected themeService: NbThemeService) {
		this.themeService
			.getJsTheme()
			.pipe(takeWhile(() => this.alive))
			.subscribe((theme) => {
				this.currentTheme = theme.name;
			});
	}

	ngOnDestroy() {
		this.alive = false;
	}
}
