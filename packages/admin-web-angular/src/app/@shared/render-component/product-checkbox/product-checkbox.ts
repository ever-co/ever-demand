import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div class="text-center">
			<input [(ngModel)]="rowData.checked" type="checkbox" />
		</div>
	`,
})
export class ProductCheckboxComponent implements ViewCell, OnInit {
	@Input()
	value: string | number;

	@Input()
	rowData: any;

	constructor() {}

	ngOnInit() {}
}
