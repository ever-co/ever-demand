import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSliderComponent } from './image.slider.component';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageSliderComponent],
	exports: [ImageSliderComponent],
	// <swiper-container> and <swiper-slide> are custom elements (Swiper Element).
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageSliderModule {}
