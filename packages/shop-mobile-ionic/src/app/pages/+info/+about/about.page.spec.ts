import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { AboutPage } from './about.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('AboutPage', () => {
	let component: AboutPage;
	let fixture: ComponentFixture<AboutPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AboutPage],
			imports: [...translateTesting()],
			providers: [
				{
					provide: UserRouter,
					useValue: createSpyObj('UserRouter', {
						getAboutUs: of(''),
					}),
				},
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AboutPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
