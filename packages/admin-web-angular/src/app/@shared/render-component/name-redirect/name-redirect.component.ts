import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { Router } from '@angular/router';

@Component({
	standalone: false,
	styleUrls: ['name-redirect.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './name-redirect.component.html',
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
