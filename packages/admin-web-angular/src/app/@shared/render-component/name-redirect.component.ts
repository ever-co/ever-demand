import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';

@Component({
	styleUrls: ['name-redirect.component.scss'],
	template: `
		<div (click)="redirect()" class="redirectBtn">
			<h6 class="warehouse-name-smt">
				<strong>{{ rowData.name }}</strong>
			</h6>
		</div>
	`,
})
export class RedirectNameComponent implements ViewCell, OnInit {
	value: string | number;
	redirectPage: string;
	@Input()
	rowData: any;

	constructor(private readonly router: Router) {}

	ngOnInit() {}
	redirect() {
		if (this.redirectPage) {
			this.router.navigate([`${this.redirectPage}/${this.rowData.id}`]);
		}
	}
}
