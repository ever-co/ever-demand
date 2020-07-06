import { Component } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	selector: 'image-table',
	styles: ['img { width: 64px; height: 64px}'],
	template: `
		<span class="image-component">
			<img *ngIf="rowData?.image" [src]="rowData?.image" />
		</span>
	`,
})
export class ImageTableComponent implements ViewCell {
	value: string | number;
	rowData: any;
}
