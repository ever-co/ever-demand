import 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElapsedTimeComponent } from './elapsed-time.component';

describe('ElapsedTimeComponent', () => {
	let component: ElapsedTimeComponent;
	let fixture: ComponentFixture<ElapsedTimeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ElapsedTimeComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ElapsedTimeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
