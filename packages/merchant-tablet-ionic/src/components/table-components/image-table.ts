import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from './smart-table';

@Component({
	standalone: false,
	selector: 'image-table',
	styles: ['img { width: 64px; height: 64px}'],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<span class="image-component">
			<img
				*ngIf="rowData?.image"
				[src]="$safeNavigationMigration(rowData?.image)"
			/>
		</span>
	`,
})
export class ImageTableComponent implements ViewCell {
	value: string | number;
	rowData: any;
}
