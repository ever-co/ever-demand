import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { ImageSliderComponent } from './image.slider.component';

@NgModule({
	imports: [SwiperModule, CommonModule],
	declarations: [ImageSliderComponent],
	exports: [ImageSliderComponent],
})
export class ImageSliderModule {}
