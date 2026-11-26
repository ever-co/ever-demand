import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { AppModule } from './app/app.module';
import { registerAppIcons } from './app/icons';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

// <swiper-container> replaces the removed <ion-slides> (Ionic 7+).
registerSwiperElements();

// The standalone <ion-icon> renders only the icons registered here.
registerAppIcons();

platformBrowser()
	.bootstrapModule(AppModule, {
		// The pages rely on Zone.js change detection (socket.io and timer callbacks).
		applicationProviders: [provideZoneChangeDetection()],
	})
	.catch((err) => {
		// TODO: we probably should also send error to Sentry here
		console.error(err);
	});
