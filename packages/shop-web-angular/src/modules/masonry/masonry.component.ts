import {
	Component,
	OnInit,
	OnDestroy,
	Input,
	Output,
	ElementRef,
	EventEmitter,
} from '@angular/core';

import masonry from 'masonry-layout';

declare var require: any;
declare var imagesLoaded: any;

import { MasonryOptions } from './masonry-options';

@Component({
	selector: '[masonry], masonry',
	template: '<ng-content></ng-content>',
})
export class MasonryComponent implements OnInit, OnDestroy {
	public _msnry: any;
	// private _imagesLoaded = null;

	// Inputs
	@Input()
	public options: MasonryOptions = {};
	@Input()
	public useImagesLoaded: boolean = false;

	// Outputs
	@Output()
	public layoutComplete: EventEmitter<any[]> = new EventEmitter<any[]>();
	@Output()
	public removeComplete: EventEmitter<any[]> = new EventEmitter<any[]>();

	constructor(private readonly _element: ElementRef) {}

	ngOnInit() {
		/// TODO: How to load imagesloaded only if this.useImagesLoaded===true?
		// if (this.useImagesLoaded) {
		//     this._imagesLoaded = require('imagesloaded');
		// }

		// Set default itemSelector
		if (!this.options.itemSelector) {
			this.options.itemSelector = '[masonry-brick], masonry-brick';
		}

		// Set element display to block
		if (this._element.nativeElement.tagName === 'MASONRY') {
			this._element.nativeElement.style.display = 'block';
		}

		// Initialize Masonry
		this._msnry = new masonry(this._element.nativeElement, this.options);

		// console.log('AngularMasonry:', 'Initialized');

		// Bind to events
		this._msnry.on('layoutComplete', (items: any) => {
			this.layoutComplete.emit(items);
		});
		this._msnry.on('removeComplete', (items: any) => {
			this.removeComplete.emit(items);
		});
	}

	ngOnDestroy() {
		if (this._msnry) {
			this._msnry.destroy();
		}
	}

	layout() {
		setTimeout(() => {
			this._msnry.layout();
		});

		// console.log('AngularMasonry:', 'Layout');
	}

	// public add(element: HTMLElement, prepend: boolean = false) {
	add(element: HTMLElement) {
		let isFirstItem = false;

		// Check if first item
		if (this._msnry.items.length === 0) {
			isFirstItem = true;
		}

		if (this.useImagesLoaded) {
			imagesLoaded(element, (instance: any) => {
				this._element.nativeElement.appendChild(element);

				// Tell Masonry that a child element has been added
				this._msnry.appended(element);

				// layout if first item
				if (isFirstItem) {
					this.layout();
				}
			});

			this._element.nativeElement.removeChild(element);
		} else {
			// Tell Masonry that a child element has been added
			this._msnry.appended(element);

			// layout if first item
			if (isFirstItem) {
				this.layout();
			}
		}

		// console.log('AngularMasonry:', 'Brick added');
	}

	remove(element: HTMLElement) {
		// Tell Masonry that a child element has been removed
		this._msnry.remove(element);

		// Layout items
		this.layout();

		// console.log('AngularMasonry:', 'Brick removed');
	}
}
