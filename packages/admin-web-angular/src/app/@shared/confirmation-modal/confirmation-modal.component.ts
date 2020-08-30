import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	OnDestroy,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
	styleUrls: ['./confirmation-modal.component.scss'],
	templateUrl: './confirmation-modal.component.html',
})
export class ConfimationModalComponent implements OnInit, OnDestroy {
	public ngDestroy$ = new Subject<void>();

	public prefix: string = 'CONFIRM_MODAL.';
	public confirmButton: string = 'YES';
	public cancelButton: string = 'NO';
	public mainText: string;

	@Output()
	confirmEvent = new EventEmitter();

	constructor(
		private readonly activeModal: NgbActiveModal,
		private translateService: TranslateService
	) {
		if (!this.mainText) {
			this.mainText = 'ARE_YOU_SURE';
		}
	}

	ngOnInit(): void {}

	mainTextTr() {
		const forTranslate = this.prefix + this.mainText;
		return this._translate(forTranslate);
	}
	confirmButtonTr() {
		const forTranslate = this.prefix + this.confirmButton;
		return this._translate(forTranslate);
	}

	cancelButtonTr() {
		const forTranslate = this.prefix + this.cancelButton;
		return this._translate(forTranslate);
	}

	cancel() {
		this.activeModal.dismiss('canceled');
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
