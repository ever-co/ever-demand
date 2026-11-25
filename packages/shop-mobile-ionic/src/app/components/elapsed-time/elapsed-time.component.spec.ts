import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from 'app/services/store.service';
import { ElapsedTimeComponent } from './elapsed-time.component';
import { translateTesting } from 'app/testing/translate';

describe('ElapsedTimeComponent', () => {
	let component: ElapsedTimeComponent;
	let fixture: ComponentFixture<ElapsedTimeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ElapsedTimeComponent],
			imports: [...translateTesting()],
			providers: [
				// A finished order, so the component starts no timer.
				{
					provide: Store,
					useValue: {
						endOrderTime: JSON.stringify({
							timePassed: '05 : 00',
						}),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ElapsedTimeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
