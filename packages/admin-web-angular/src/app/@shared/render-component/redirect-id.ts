import { Component, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';

@Component({
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
