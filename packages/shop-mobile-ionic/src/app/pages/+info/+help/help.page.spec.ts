import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { of } from 'rxjs';
import { HelpPage } from './help.page';

describe('HelpPage', () => {
	let component: HelpPage;
	let fixture: ComponentFixture<HelpPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [HelpPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{
						provide: UserRouter,
						useValue: jasmine.createSpyObj('UserRouter', {
							getHelp: of(''),
						}),
					},
					{ provide: Platform, useValue: { isRTL: false } },
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(HelpPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
