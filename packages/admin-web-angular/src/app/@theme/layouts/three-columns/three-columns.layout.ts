import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';

// TODO: move layouts into the framework
@Component({
	standalone: false,
	selector: 'ngx-three-columns-layout',
	styleUrls: ['./three-columns.layout.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
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
