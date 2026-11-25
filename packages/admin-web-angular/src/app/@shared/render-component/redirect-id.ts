import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { Router } from '@angular/router';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<button class="btn btn-sm btn-outline-secondary" (click)="redirect()">
			{{ rowData.id }}
		</button>
	`,
})
export class RedirectIdComponent implements ViewCell {
	@Input()
	value: string | number;

	@Input()
	baseUrl: string;

	@Input()
	rowData: { id: string | number };

	constructor(private readonly router: Router) {}

	redirect() {
		if (this.baseUrl && this.rowData.id) {
			this.router.navigate([`${this.baseUrl}/${this.rowData.id}`]);
		}
	}
}
