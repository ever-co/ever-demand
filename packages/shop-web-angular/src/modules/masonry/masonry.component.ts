import {
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';

import { MasonryOptions } from './masonry-options';

/**
 * Masonry ("Pinterest") layout of the `masonry-brick` children: every brick goes into the
 * shortest column, from left to right. A small native replacement for the unmaintained
 * `masonry-layout` package, with the same inputs and outputs as the old wrapper.
 *
 * Bricks must have the same width (the shop uses 350px cards). With `fitWidth` the
 * container is as wide as the columns that fit in its parent, so `margin: auto` centers it.
 */
@Component({
	standalone: false,
	selector: '[masonry], masonry',
	template: '<ng-content></ng-content>',
	styles: [':host { display: block; position: relative; }'],
})
export class MasonryComponent implements OnInit, OnDestroy {
	@Input()
	public options: MasonryOptions = {};

	/** Kept for compatibility with the old wrapper; images report their own `load`. */
	@Input()
	public useImagesLoaded: boolean = false;

	@Output()
	public layoutComplete: EventEmitter<HTMLElement[]> = new EventEmitter<
		HTMLElement[]
	>();
	@Output()
	public removeComplete: EventEmitter<HTMLElement[]> = new EventEmitter<
		HTMLElement[]
	>();

	private readonly bricks: HTMLElement[] = [];
	private layoutTimer: ReturnType<typeof setTimeout> | null = null;
	private destroyed = false;

	constructor(private readonly _element: ElementRef<HTMLElement>) {}

	/** The bricks in the order they were added (the order of the template). */
	get items(): readonly HTMLElement[] {
		return this.bricks;
	}

	ngOnInit() {
		// Set element display to block
		if (this._element.nativeElement.tagName === 'MASONRY') {
			this._element.nativeElement.style.display = 'block';
		}
	}

	ngOnDestroy() {
		this.destroyed = true;
		if (this.layoutTimer != null) {
			clearTimeout(this.layoutTimer);
		}
	}

	@HostListener('window:resize')
	onWindowResize() {
		if (this.options.resize !== false) {
			this.layout();
		}
	}

	/** Lays the bricks out on the next tick (several calls in a row lay out once). */
	layout() {
		if (this.layoutTimer != null || this.destroyed) {
			return;
		}

		this.layoutTimer = setTimeout(() => {
			this.layoutTimer = null;
			if (!this.destroyed) {
				this.layoutNow();
			}
		});
	}

	add(element: HTMLElement) {
		const isFirstItem = this.bricks.length === 0;

		element.style.position = 'absolute';
		this.bricks.push(element);

		// layout if first item, later bricks are laid out by their own changes
		if (isFirstItem || this.options.initLayout !== false) {
			this.layout();
		}
	}

	remove(element: HTMLElement) {
		const index = this.bricks.indexOf(element);
		if (index !== -1) {
			this.bricks.splice(index, 1);
			this.removeComplete.emit([element]);
		}

		// Layout items
		this.layout();
	}

	/** Positions every brick now, in the shortest column, and sizes the container. */
	layoutNow() {
		const container = this._element.nativeElement;
		const items = this.bricks;
		const gutter = toPixels(this.options.gutter);

		if (items.length === 0) {
			container.style.height = '0px';
			this.layoutComplete.emit([]);
			return;
		}

		const columnWidth =
			toPixels(this.options.columnWidth) || outerWidth(items[0]);
		const available = this.options.fitWidth
			? (container.parentElement || container).clientWidth
			: container.clientWidth;
		const columns = Math.max(
			1,
			Math.floor((available + gutter) / (columnWidth + gutter))
		);

		const heights: number[] = new Array(columns).fill(0);

		for (const item of items) {
			const column = heights.indexOf(Math.min(...heights));
			const left = column * (columnWidth + gutter);

			if (this.options.originLeft === false) {
				item.style.right = `${left}px`;
			} else {
				item.style.left = `${left}px`;
			}
			item.style.top = `${heights[column]}px`;

			heights[column] += outerHeight(item) + gutter;
		}

		container.style.height = `${Math.max(0, Math.max(...heights) - gutter)}px`;

		if (this.options.fitWidth) {
			const used = Math.min(columns, items.length);
			container.style.width = `${used * (columnWidth + gutter) - gutter}px`;
		}

		this.layoutComplete.emit([...items]);
	}
}

function toPixels(value: number | string | undefined): number {
	if (typeof value === 'number') {
		return value;
	}
	const parsed = parseFloat(value || '');
	return Number.isFinite(parsed) ? parsed : 0;
}

function margins(element: HTMLElement, a: string, b: string): number {
	const style = getComputedStyle(element);
	return (parseFloat(style[a]) || 0) + (parseFloat(style[b]) || 0);
}

function outerWidth(element: HTMLElement): number {
	return element.offsetWidth + margins(element, 'marginLeft', 'marginRight');
}

function outerHeight(element: HTMLElement): number {
	return element.offsetHeight + margins(element, 'marginTop', 'marginBottom');
}
