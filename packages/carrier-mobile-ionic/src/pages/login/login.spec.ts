import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { LoginPage } from './login';
import { LoginPageModule } from './login.module';
import { TranslateService } from '@ngx-translate/core';
import he from '../../assets/i18n/he.json';

describe('LoginPage', () => {
	let auth: { login: ReturnType<typeof vi.fn> };
	let store: Record<string, unknown>;
	let router: { navigateByUrl: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		auth = { login: vi.fn() };
		store = {};
		router = { navigateByUrl: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [LoginPageModule, TranslateModule.forRoot()],
			providers: [
				{ provide: AuthService, useValue: auth },
				{ provide: Store, useValue: store },
				{ provide: Router, useValue: router },
			],
		}).compileComponents();
	});

	it('renders the login form with the default credentials', async () => {
		const fixture = TestBed.createComponent(LoginPage);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const el: HTMLElement = fixture.nativeElement;
		const username = el.querySelector<HTMLInputElement>('#username');
		const password = el.querySelector<HTMLInputElement>('#password');
		expect(username.value).toBe(fixture.componentInstance.user.username);
		expect(password.type).toBe('password');
		expect(el.querySelector('button.login-button')).not.toBeNull();
	});

	it('says the username or password is wrong in the language the carrier picked', async () => {
		auth.login.mockReturnValue(of({ token: null, carrier: null }));
		const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
		const translate = TestBed.inject(TranslateService);
		translate.setTranslation('he', he);
		translate.use('he');
		const page = TestBed.createComponent(LoginPage).componentInstance;

		await page.login();

		const text = (he as any).LOGIN_VIEW.WRONG_CREDENTIALS;
		expect(text).toEqual(expect.any(String));
		expect(alert).toHaveBeenLastCalledWith(text);
		expect(router.navigateByUrl).not.toHaveBeenCalled();
	});

	it('stores the session and opens the main page after a login', async () => {
		auth.login.mockReturnValue(
			of({ token: 'jwt', carrier: { id: 'c1' } })
		);
		const page = TestBed.createComponent(LoginPage).componentInstance;
		page.user = { username: 'ever', password: 'changeme' };

		await page.login();

		expect(auth.login).toHaveBeenCalledWith('ever', 'changeme');
		expect(store.carrierId).toBe('c1');
		expect(store.token).toBe('jwt');
		expect(router.navigateByUrl).toHaveBeenCalledWith('main', {
			skipLocationChange: false,
		});
	});

	it('warns when the carrier does not exist', async () => {
		auth.login.mockReturnValue(of(null));
		const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
		const page = TestBed.createComponent(LoginPage).componentInstance;

		await page.login();

		expect(alert).toHaveBeenCalledWith('LOGIN_VIEW.WRONG_CREDENTIALS');
		expect(router.navigateByUrl).not.toHaveBeenCalled();
	});
});
