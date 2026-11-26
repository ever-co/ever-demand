import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { HelpPage } from './help.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('HelpPage', () => {
	let component: HelpPage;
	let fixture: ComponentFixture<HelpPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HelpPage],
			imports: [...translateTesting()],
			providers: [
				{
					provide: UserRouter,
					useValue: createSpyObj('UserRouter', {
						getHelp: of(''),
					}),
				},
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(HelpPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
