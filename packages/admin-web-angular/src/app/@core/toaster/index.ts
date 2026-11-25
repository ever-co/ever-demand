import {
	Component,
	Injectable,
	Input,
	ModuleWithProviders,
	NgModule,
	ChangeDetectionStrategy,
} from '@angular/core';
import { NbToastRef, NbToastrService } from '@nebular/theme';
import { Observable, of } from 'rxjs';

/**
 * The parts of angular2-toaster's API the admin uses, rendered with Nebular's toastr.
 *
 * angular2-toaster is dead (View Engine only). Screens keep calling
 * `toasterService.pop(type, title, body)`; the toasts now show through `NbToastrService`
 * (one global container, so `<toaster-container>` is only a placeholder).
 */
export type ToastType =
	'success' | 'error' | 'warning' | 'info' | 'wait' | string;

export enum BodyOutputType {
	Default,
	TrustedHtml,
	Component,
}

export interface Toast {
	type: ToastType;
	title?: string;
	body?: any;
	toastId?: string;
	toastContainerId?: number;
	timeout?: number;
	showCloseButton?: boolean;
	bodyOutputType?: BodyOutputType;
	[key: string]: any;
}

export class ToasterConfig {
	limit?: number;
	tapToDismiss?: boolean;
	showCloseButton?: boolean | object;
	newestOnTop?: boolean;
	timeout?: number | object;
	positionClass?: string;
	animation?: string;
	preventDuplicates?: boolean;
	[key: string]: any;

	constructor(config: Partial<ToasterConfig> = {}) {
		Object.assign(this, config);
	}
}

const STATUS: Record<string, string> = {
	success: 'success',
	error: 'danger',
	warning: 'warning',
	info: 'info',
	wait: 'info',
};

const DEFAULT_DURATION = 5000;

@Injectable({ providedIn: 'root' })
export class ToasterService {
	private readonly _open = new Map<string, NbToastRef>();
	private _counter = 0;

	constructor(private readonly _toastr: NbToastrService) {}

	pop(type: ToastType | Toast, title?: string, body?: any): Toast {
		const toast: Toast =
			typeof type === 'string' ? { type, title, body } : { ...type };
		toast.toastId = toast.toastId ?? String(++this._counter);

		const status = STATUS[toast.type] ?? 'basic';
		// angular2-toaster showed `title` bold and `body` below it; Nebular calls them title/message.
		const message = toast.body ?? '';
		const ref = this._toastr.show(message, toast.title ?? '', {
			status,
			duration: toast.timeout ?? DEFAULT_DURATION,
			destroyByClick: true,
			preventDuplicates: false,
		});
		this._open.set(toast.toastId, ref);
		ref.onClose().subscribe(() => this._open.delete(toast.toastId));
		return toast;
	}

	popAsync(
		type: ToastType | Toast,
		title?: string,
		body?: any,
	): Observable<Toast> {
		return of(this.pop(type, title, body));
	}

	clear(toastId?: string, _toastContainerId?: number): void {
		if (toastId !== undefined) {
			this._open.get(toastId)?.close();
			return;
		}
		for (const ref of [...this._open.values()]) {
			ref.close();
		}
	}
}

/** Placeholder for angular2-toaster's container: Nebular renders toasts in one global container. */
@Component({
	selector: 'toaster-container',
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: '',
})
export class ToasterContainerComponent {
	@Input() toasterconfig: ToasterConfig;
}

@NgModule({
	declarations: [ToasterContainerComponent],
	exports: [ToasterContainerComponent],
})
export class ToasterModule {
	static forRoot(): ModuleWithProviders<ToasterModule> {
		return { ngModule: ToasterModule, providers: [] };
	}

	static forChild(): ModuleWithProviders<ToasterModule> {
		return { ngModule: ToasterModule, providers: [] };
	}
}
