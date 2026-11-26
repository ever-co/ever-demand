import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitePage } from './invite.page';

describe('InvitePage', () => {
	let component: InvitePage;
	let fixture: ComponentFixture<InvitePage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [InvitePage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(InvitePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
