import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElapsedTimeComponent } from './elapsed-time.component';

@Pipe({ name: 'translate', standalone: false })
class TranslateStubPipe implements PipeTransform {
	transform(key: string): string {
		return key;
	}
}

describe('ElapsedTimeComponent', () => {
	let component: ElapsedTimeComponent;
	let fixture: ComponentFixture<ElapsedTimeComponent>;

	beforeEach(() => {
		localStorage.clear();
		TestBed.configureTestingModule({
			declarations: [ElapsedTimeComponent, TranslateStubPipe],
		});
	});

	afterEach(() => {
		clearInterval(component?.timer);
		localStorage.clear();
	});

	it('should create and start the simulation timer', () => {
		fixture = TestBed.createComponent(ElapsedTimeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		expect(component).toBeTruthy();
		expect(component.timer).toBeDefined();
		expect(component.timePasssed).toEqual({ timePassed: '00 : 00' });
	});
});
