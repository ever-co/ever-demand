import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { MessagePopUpModalModule } from './message-pop-up.module';
import { MessagePopUpComponent } from './message-pop-up.component';

describe('MessagePopUpComponent', () => {
	const dialogRef = { close: vi.fn() };

	function create(data: object) {
		TestBed.configureTestingModule({
			imports: [MessagePopUpModalModule, TranslateModule.forRoot()],
			providers: [
				{ provide: MatDialogRef, useValue: dialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: data },
			],
		});
		const translate = TestBed.inject(TranslateService);
		translate.setTranslation('en-US', {
			MESSAGE_POP_UP: {
				CONFIRMATION: 'Confirmation',
				CANCEL_ORDER: 'Cancel the order?',
				CANCEL: 'Cancel',
				OK: 'OK',
			},
		});
		translate.use('en-US');
		const fixture = TestBed.createComponent(MessagePopUpComponent);
		fixture.detectChanges();
		return fixture;
	}

	it('translates the texts of the dialog under MESSAGE_POP_UP', () => {
		const fixture = create({
			modalTitle: 'CONFIRMATION',
			commonText: 'CANCEL_ORDER',
			cancelButton: 'CANCEL',
			confirmButton: 'OK',
		});
		const component = fixture.componentInstance;
		const text = fixture.nativeElement.textContent;

		expect(component.modalTitle).toBe('MESSAGE_POP_UP.CONFIRMATION');
		expect(text).toContain('Confirmation');
		expect(text).toContain('Cancel the order?');
		expect(text).toContain('Cancel');
		expect(text).toContain('OK');
	});

	it('shows only the buttons it is given', () => {
		const fixture = create({
			modalTitle: 'CONFIRMATION',
			commonText: 'CANCEL_ORDER',
			confirmButton: 'OK',
		});

		expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
	});

	it('closes without a result on "x"', () => {
		const fixture = create({ modalTitle: 'CONFIRMATION' });

		fixture.nativeElement.querySelector('.icon-right').click();

		expect(dialogRef.close).toHaveBeenCalledWith();
	});
});
