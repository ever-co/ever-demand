import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuController } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { Store } from 'app/services/store.service';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
	let component: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [MenuComponent],
				imports: [TranslateModule.forRoot()],
				providers: [
					{ provide: Store, useValue: { maintenanceMode: null } },
					{
						provide: WarehouseRouter,
						useValue: jasmine.createSpyObj('WarehouseRouter', [
							'get',
						]),
					},
					{
						provide: MenuController,
						useValue: jasmine.createSpyObj('MenuController', [
							'enable',
						]),
					},
				],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(MenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
