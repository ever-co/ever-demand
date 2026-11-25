import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

/**
 * TestBed imports for components that use the `translate` pipe: the root TranslateService
 * (no loader, so `instant(key)` returns the key) plus the pipe and the directive themselves.
 * The unit-test build compiles without JIT scope data, so TestBed cannot see the pipe
 * through the common-angular TranslateModule shim alone.
 */
export const translateTesting = () => [
	TranslateModule.forRoot(),
	TranslatePipe,
	TranslateDirective,
];
