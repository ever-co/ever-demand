import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	standalone: false,
	selector: 'ngx-miscellaneous',
	changeDetection: ChangeDetectionStrategy.Eager,
	template: ` <router-outlet></router-outlet> `,
})
export class MiscellaneousComponent {}
