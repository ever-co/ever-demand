import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { TermsOfUsePage } from './terms-of-use.page';

describe('TermsOfUsePage', () => {
	let component: TermsOfUsePage;
	let fixture: ComponentFixture<TermsOfUsePage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [TermsOfUsePage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{
						provide: UserRouter,
						useValue: jasmine.createSpyObj('UserRouter', {
							getTermsOfUse: of(''),
						}),
					},
					{ provide: Platform, useValue: { isRTL: false } },
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(TermsOfUsePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
