import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserLocationsPage } from './user-locations.page';

describe('UserLocationsPage', () => {
	let component: UserLocationsPage;
	let fixture: ComponentFixture<UserLocationsPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UserLocationsPage],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(UserLocationsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
