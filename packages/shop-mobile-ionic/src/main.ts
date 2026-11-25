import { platformBrowser } from '@angular/platform-browser';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { AppModule } from 'app/app.module';

// <swiper-container> / <swiper-slide> replace ion-slides (removed in Ionic 7).
registerSwiperElements();

platformBrowser()
	.bootstrapModule(AppModule)
	.catch((err) => {
		// TODO: we probably should also send error to Sentry here
		console.log(err);
	});
