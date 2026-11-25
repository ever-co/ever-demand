import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { LoadedInformationComponent } from './loaded-information.component';

describe('LoadedInformationComponent', () => {
	let component: LoadedInformationComponent;
	let fixture: ComponentFixture<LoadedInformationComponent>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [LoadedInformationComponent],
				imports: [PipesModule],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(LoadedInformationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
