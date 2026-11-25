import {
	Directive,
	Inject,
	ElementRef,
	forwardRef,
	OnDestroy,
	AfterViewInit,
} from '@angular/core';

import { MasonryComponent } from './masonry.component';

@Directive({
	standalone: false,
	selector: '[masonry-brick], masonry-brick',
})
export class MasonryBrickDirective implements OnDestroy, AfterViewInit {
	private observer: MutationObserver | null = null;

	constructor(
		private readonly _element: ElementRef,
		@Inject(forwardRef(() => MasonryComponent))
		private readonly _parent: MasonryComponent
	) {}

	ngAfterViewInit() {
		this._parent.add(this._element.nativeElement);
		this.watchForHtmlChanges();
	}

	ngOnDestroy() {
		if (this.observer) {
			this.observer.disconnect();
		}
		this._parent.remove(this._element.nativeElement);
	}

	/** When HTML in brick changes dynamically, observe that and change layout */
	private watchForHtmlChanges(): void {
		if (typeof MutationObserver === 'undefined') {
			return;
		}

		/** Watch for any changes to subtree */
		this.observer = new MutationObserver(() => this._parent.layout());

		// define what element should be observed by the observer
		// and what types of mutations trigger the callback
		this.observer.observe(this._element.nativeElement, {
			subtree: true,
			childList: true,
		});
	}
}
