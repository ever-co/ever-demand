import {
	Directive,
	Inject,
	ElementRef,
	forwardRef,
	OnDestroy,
	AfterViewInit,
} from '@angular/core';

import { MasonryComponent } from './masonry.component';

interface MutationWindow extends Window {
	MutationObserver: any;
	WebKitMutationObserver: any;
}

declare var window: MutationWindow;

@Directive({
	selector: '[masonry-brick], masonry-brick',
})
export class MasonryBrickDirective implements OnDestroy, AfterViewInit {
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
		this._parent.remove(this._element.nativeElement);
	}

	/** When HTML in brick changes dynamically, observe that and change layout */
	private watchForHtmlChanges(): void {
		MutationObserver =
			window.MutationObserver || window.WebKitMutationObserver;

		if (MutationObserver) {
			/** Watch for any changes to subtree */
			const observer = new MutationObserver(
				(mutations, observerFromElement) => {
					this._parent.layout();
				}
			);

			// define what element should be observed by the observer
			// and what types of mutations trigger the callback
			observer.observe(this._element.nativeElement, {
				subtree: true,
				childList: true,
			});
		}
	}
}
