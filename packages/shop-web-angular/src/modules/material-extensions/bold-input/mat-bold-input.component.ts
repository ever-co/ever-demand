import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	ViewChild,
	OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRipple } from '@angular/material/core';

import { InputComponent } from './input-component';

@Component({
	selector: 'mat-bold-input',
	styleUrls: ['./mat-bold-input.component.scss'],
	templateUrl: 'mat-bold-input.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: MatBoldInputComponent,
			multi: true,
		},
	],
})
export class MatBoldInputComponent extends InputComponent
	implements OnInit, ControlValueAccessor {
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
	public rippleSpeedFactor: number = 2;

	@ViewChild(MatRipple)
	public ripple: MatRipple;

	@ViewChild('input')
	public input: ElementRef;

	@HostBinding('class.mat-focused')
	public isFocused: boolean = false;

	public RIPPLE_FADE_IN_DURATION = 450;

	private focusTimeout: number | null = null;

	ngOnInit() {
		if (!this.color) {
			throw new Error("Attribute 'color' is required");
		}

		if (!this.focusedColor) {
			throw new Error("Attribute 'focusedColor' is required");
		}
	}

	private onFocus() {
		if (this.focusTimeout != null) {
			return;
		}

		this.focusTimeout = window.setTimeout(() => {
			this.isFocused = true;
		}, this.RIPPLE_FADE_IN_DURATION / this.rippleSpeedFactor);
	}

	private onBlur() {
		this.isFocused = false;

		if (this.focusTimeout != null) {
			clearTimeout(this.focusTimeout);
			this.focusTimeout = null;
		}
	}
}
