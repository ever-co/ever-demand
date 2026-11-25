import { provideZoneChangeDetection, type EnvironmentProviders, type Provider } from '@angular/core';

// Providers of the TestBed environment (angular.json test.options.providersFile).
// The app runs with zone.js change detection (see AppModule), so the specs do too:
// `fixture.detectChanges()` then refreshes a component after a plain field changed,
// as it did under Karma.
const providers: (Provider | EnvironmentProviders)[] = [provideZoneChangeDetection()];

export default providers;
