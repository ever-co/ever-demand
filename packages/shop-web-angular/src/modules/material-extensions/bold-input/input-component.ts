import { EventEmitter, Input, Directive } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive()
export abstract class InputComponent implements ControlValueAccessor {
	@Input()
	public placeholder: string = '';

	@Input()
	public type: string = 'text';

	@Input()
	public disabled: boolean = false;

	@Input()
	public required: boolean = false;

	private _value: string;

	private changes: EventEmitter<string> = new EventEmitter<string>();
	private touches: EventEmitter<void> = new EventEmitter<void>();

	public get value(): string {
		return this._value;
	}

	public set value(value: string) {
		if (this._value !== value) {
			this._value = value;
			this.changes.emit(value);
		}
	}

	writeValue(value: any) {
		if (typeof value !== 'string') {
			throw new Error('Written value is not string!');
		}

		if (value == null) {
			value = '';
		}

		this._value = value;
	}

	registerOnChange(fn: (value: string) => void) {
		this.changes.subscribe(fn);
	}

	registerOnTouched(fn: () => void) {
		this.touches.subscribe(fn);
	}

	// Allows Angular to disable the input.
	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	touch() {
		this.touches.emit();
	}
}
