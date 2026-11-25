import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

platformBrowser()
	.bootstrapModule(AppModule, {
		// The pages rely on Zone.js change detection (socket.io and timer callbacks).
		applicationProviders: [provideZoneChangeDetection()],
	})
	.catch((err) => {
		// TODO: we probably should also send error to Sentry here
		console.error(err);
	});
