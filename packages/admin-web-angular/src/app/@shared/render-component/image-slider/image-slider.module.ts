import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { ImageSliderComponent } from './image.slider.component';
@NgModule({
	imports: [NgxUsefulSwiperModule, CommonModule],
	declarations: [ImageSliderComponent],
	exports: [ImageSliderComponent],
})
export class ImageSliderModule {}
