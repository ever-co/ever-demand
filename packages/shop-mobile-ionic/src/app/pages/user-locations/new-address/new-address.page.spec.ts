import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewAddressPage } from './new-address.page';

describe('NewAddressPage', () => {
	let component: NewAddressPage;
	let fixture: ComponentFixture<NewAddressPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [NewAddressPage],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(NewAddressPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
