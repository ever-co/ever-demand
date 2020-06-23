import { Component, Input } from '@angular/core';
import { SwiperOptions } from 'swiper';

@Component({
	selector: 'image-slider',
	styleUrls: ['./image-slider.component.scss'],
	templateUrl: './image-slider.component.html',
})
export class ImageSliderComponent {
	@Input() slideImages: any;

	config: SwiperOptions = {
		pagination: { el: '.swiper-pagination', clickable: true },
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		autoplay: {
			delay: 5000,
		},
		speed: 800,
		loop: true,
	};

	public colors = [1, 2, 3, 4];
}
