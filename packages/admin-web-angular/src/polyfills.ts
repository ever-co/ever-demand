/**
 * Loaded before the app (angular.json `polyfills`).
 */

// The @pyro/db entity decorators in @modules/server.common read and write Reflect metadata.
import 'reflect-metadata';

// The app is NgModule based and relies on Zone.js change detection
// (see `provideZoneChangeDetection()` in AppModule).
import 'zone.js';

// `$localize`, needed by @ng-bootstrap/ng-bootstrap.
import '@angular/localize/init';

if (typeof SVGElement.prototype.contains === 'undefined') {
	SVGElement.prototype.contains = HTMLDivElement.prototype.contains;
}

// Some shared (isomorphic) code still reads `global`.
(window as any).global = window;
