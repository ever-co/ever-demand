import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { TermsOfUsePage } from './terms-of-use.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('TermsOfUsePage', () => {
	let component: TermsOfUsePage;
	let fixture: ComponentFixture<TermsOfUsePage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TermsOfUsePage],
			imports: [...translateTesting()],
			providers: [
				{
					provide: UserRouter,
					useValue: createSpyObj('UserRouter', {
						getTermsOfUse: of(''),
					}),
				},
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TermsOfUsePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
