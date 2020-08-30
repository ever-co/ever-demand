import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	ViewChild,
	Output,
	EventEmitter,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';

@Component({
	selector: 'mat-search',
	styleUrls: ['./mat-search.component.scss'],
	templateUrl: './mat-search.component.html',
})
export class MatSearchComponent {
	@HostBinding('class.mat-focusing')
	public get isFocusing(): boolean {
		return this.focusTimeout != null;
	}
	@Input()
	@HostBinding('style.background-color')
	public color: string;

	@Input()
	public focusedColor: string;

	@Input()
	address: string;

	@Output()
	searchLocation: EventEmitter<string> = new EventEmitter();

	@Output()
	detectLocation: EventEmitter<boolean> = new EventEmitter();

	@ViewChild(MatRipple)
	public ripple: MatRipple;

	@ViewChild('searchButton')
	public searchButton: MatButton;

	@ViewChild('input')
	public input: ElementRef;

	@HostBinding('class.mat-focused')
	public isFocused: boolean = false;

	public rippleSpeedFactor: number = 2;

	public RIPPLE_FADE_IN_DURATION = 450;

	private focusTimeout: number | null = null;

	onFocus() {
		if (this.focusTimeout != null) {
			return;
		}

		this.focusTimeout = window.setTimeout(() => {
			this.isFocused = true;
		}, this.RIPPLE_FADE_IN_DURATION / this.rippleSpeedFactor);
	}

	onBlur() {
		this.isFocused = false;

		if (this.focusTimeout != null) {
			clearTimeout(this.focusTimeout);
			this.focusTimeout = null;
		}
	}

	onInputEnter() {
		this.searchButton._elementRef.nativeElement.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true })
		);

		this.searchButton._elementRef.nativeElement.dispatchEvent(
			new MouseEvent('click', { bubbles: true })
		);
		this.searchButton._elementRef.nativeElement.dispatchEvent(
			new MouseEvent('mouseup', { bubbles: true })
		);
	}

	onSearch(e: MouseEvent) {
		this.searchLocation.emit(this.input.nativeElement.value);
		e.preventDefault();
		this.input.nativeElement.focus();

		this.ripple.launch(e.pageX, e.pageY);
	}
}
