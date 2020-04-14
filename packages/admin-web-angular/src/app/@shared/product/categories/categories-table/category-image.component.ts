import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	selector: 'category-image',
	styleUrls: ['./category-image.component.scss'],
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
