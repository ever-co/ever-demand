import 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadedInformationComponent } from './loaded-information.component';

describe('LoadedInformationComponent', () => {
	let component: LoadedInformationComponent;
	let fixture: ComponentFixture<LoadedInformationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LoadedInformationComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LoadedInformationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
