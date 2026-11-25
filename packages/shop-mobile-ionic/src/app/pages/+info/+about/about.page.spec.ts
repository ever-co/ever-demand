import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
	let component: AboutPage;
	let fixture: ComponentFixture<AboutPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [AboutPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{
						provide: UserRouter,
						useValue: jasmine.createSpyObj('UserRouter', {
							getAboutUs: of(''),
						}),
					},
					{ provide: Platform, useValue: { isRTL: false } },
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(AboutPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
