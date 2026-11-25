import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	selector: 'category-image',
	styleUrls: ['./category-image.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div id="category-image"><img #image width="80px" height="80px" /></div>
	`,
})
export class CategoryImageComponent implements ViewCell, OnInit {
	value: string;
	rowData: any;

	@ViewChild('image', { static: true })
	image: ElementRef;

	ngOnInit() {
		this.image.nativeElement.src = this.value;
	}
}
