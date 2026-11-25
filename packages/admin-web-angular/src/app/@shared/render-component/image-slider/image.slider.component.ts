import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { register } from 'swiper/element/bundle';

// Registers <swiper-container> / <swiper-slide> (Swiper Element, the web-component build of
// Swiper that replaced ngx-swiper-wrapper).
register();

export interface SlideImage {
	url: string;
	title?: string;
	caption?: string;
	style?: { [key: string]: string };
}

@Component({
	standalone: false,
	selector: 'image-slider',
	styleUrls: ['./image-slider.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './image-slider.component.html',
})
export class ImageSliderComponent {
	@Input() slideImages: SlideImage[];

	/** Same behaviour as the old ngx-swiper-wrapper config. */
	readonly autoplayDelay = 5000;
	readonly speed = 800;
}
