import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { PrivacyPage } from './privacy.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('PrivacyPage', () => {
	let component: PrivacyPage;
	let fixture: ComponentFixture<PrivacyPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PrivacyPage],
			imports: [...translateTesting()],
			providers: [
				{
					provide: UserRouter,
					useValue: createSpyObj('UserRouter', {
						getPrivacy: of(''),
					}),
				},
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PrivacyPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
