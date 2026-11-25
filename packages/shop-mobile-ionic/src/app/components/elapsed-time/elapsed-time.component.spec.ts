import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from 'app/services/store.service';
import { ElapsedTimeComponent } from './elapsed-time.component';

describe('ElapsedTimeComponent', () => {
	let component: ElapsedTimeComponent;
	let fixture: ComponentFixture<ElapsedTimeComponent>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ElapsedTimeComponent],
				imports: [TranslateModule.forRoot()],
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
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ElapsedTimeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
