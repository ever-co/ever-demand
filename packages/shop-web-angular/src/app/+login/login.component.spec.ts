import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { GeoLocationRouter } from '@modules/client.common.angular2/routers/geo-location-router.service';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store';
import { LoginComponent } from './login.component';
import { LoginModule } from './login.module';

describe('LoginComponent', () => {
	beforeEach(async () => {
		localStorage.clear();
		await TestBed.configureTestingModule({
			imports: [LoginModule, TranslateModule.forRoot()],
			providers: [
				provideRouter([]),
				{ provide: InviteRequestRouter, useValue: { get: vi.fn() } },
				{ provide: InviteRouter, useValue: {} },
				{ provide: UserRouter, useValue: {} },
				{ provide: UserAuthRouter, useValue: {} },
				{ provide: GeoLocationRouter, useValue: {} },
				{ provide: Store, useValue: {} },
			],
		}).compileComponents();

		const translate = TestBed.inject(TranslateService);
		translate.setTranslation('en-US', {
			LOG_IN_VIEW: {
				CONTINUE_WITH_FACEBOOK: 'Continue with Facebook',
				CONTINUE_WITH_GOOGLE: 'Continue with Google',
				ENTER_BY_ADDRESS: 'Enter by address',
			},
		});
		translate.use('en-US');
	});

	function render() {
		const fixture = TestBed.createComponent(LoginComponent);
		fixture.detectChanges();
		return fixture.nativeElement as HTMLElement;
	}

	it('links the social sign-ins to the HTTPS services endpoint', () => {
		const page = render();
		const facebook = page.querySelector<HTMLAnchorElement>('a.fbIcon');
		const google = page.querySelector<HTMLAnchorElement>('a.googleIcon');

		expect(facebook.getAttribute('href')).toBe(
			`${environment.HTTPS_SERVICES_ENDPOINT}/auth/facebook`
		);
		expect(google.getAttribute('href')).toBe(
			`${environment.HTTPS_SERVICES_ENDPOINT}/auth/google`
		);
		expect(facebook.getAttribute('aria-label')).toBe(
			'Continue with Facebook'
		);
		expect(google.getAttribute('aria-label')).toBe('Continue with Google');
	});

	it('draws the brand icons with FontAwesome', () => {
		const page = render();

		expect(page.querySelector('a.fbIcon svg[data-icon="facebook"]')).not.toBeNull();
		expect(page.querySelector('a.googleIcon svg[data-icon="google"]')).not.toBeNull();
	});

	it('offers the address sign-up when no invite was requested', () => {
		const page = render();

		expect(page.querySelector('button.login-button').textContent).toContain(
			'Enter by address'
		);
	});

	it('hides the toolbar', () => {
		const fixture = TestBed.createComponent(LoginComponent);

		expect(fixture.componentInstance.toolbarDisabled).toBe(true);
	});
});
