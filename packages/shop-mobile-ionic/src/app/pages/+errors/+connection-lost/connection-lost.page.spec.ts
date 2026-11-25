import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ConnectionLostPage } from './connection-lost.page';

describe('ConnectionLostPage', () => {
	let component: ConnectionLostPage;
	let fixture: ComponentFixture<ConnectionLostPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ConnectionLostPage],
				imports: [TranslateModule.forRoot()],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ConnectionLostPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
