import { TestBed } from '@angular/core/testing';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { NotifyService } from '../services/notify/notify.service';
import { ToasterService } from './index';

describe('ToasterService (angular2-toaster API on Nebular toastr)', () => {
	let toastr: { show: ReturnType<typeof vi.fn> };
	let closed: Subject<void>[];
	let refs: { close: ReturnType<typeof vi.fn> }[];
	let service: ToasterService;

	beforeEach(() => {
		closed = [];
		refs = [];
		toastr = {
			show: vi.fn(() => {
				const onClose = new Subject<void>();
				closed.push(onClose);
				const ref = {
					close: vi.fn(() => onClose.next()),
					onClose: () => onClose,
				};
				refs.push(ref);
				return ref;
			}),
		};
		TestBed.configureTestingModule({
			providers: [
				{ provide: NbToastrService, useValue: toastr },
				NotifyService,
			],
		});
		service = TestBed.inject(ToasterService);
	});

	it('pop(type, title, body) shows the body as message and the title as title', () => {
		service.pop('success', 'Saved', 'The store was updated');

		expect(toastr.show).toHaveBeenCalledWith(
			'The store was updated',
			'Saved',
			expect.objectContaining({
				status: 'success',
				destroyByClick: true,
			}),
		);
	});

	it.each([
		['error', 'danger'],
		['warning', 'warning'],
		['info', 'info'],
		['wait', 'info'],
		['something-else', 'basic'],
	])('maps toast type %s to Nebular status %s', (type, status) => {
		service.pop(type, 'Title');
		expect(toastr.show.mock.calls[0][2].status).toBe(status);
	});

	it('accepts a Toast object and its timeout', () => {
		const toast = service.pop({
			type: 'error',
			title: 'Oops',
			body: 'Failed',
			timeout: 1000,
		});

		expect(toastr.show).toHaveBeenCalledWith(
			'Failed',
			'Oops',
			expect.objectContaining({ status: 'danger', duration: 1000 }),
		);
		expect(toast.toastId).toBeTruthy();
	});

	it('shows a title-only toast with an empty message', () => {
		service.pop('error', 'Something went wrong!');
		expect(toastr.show).toHaveBeenCalledWith(
			'',
			'Something went wrong!',
			expect.anything(),
		);
	});

	it('clear() closes the open toasts, clear(id) only that one', () => {
		const first = service.pop('info', 'one');
		service.pop('info', 'two');

		service.clear(first.toastId);
		expect(refs[0].close).toHaveBeenCalled();
		expect(refs[1].close).not.toHaveBeenCalled();

		service.clear();
		expect(refs[1].close).toHaveBeenCalled();
	});

	it('popAsync emits the toast', async () => {
		const values: any[] = [];
		service.popAsync('success', 'Done').subscribe((t) => values.push(t));
		expect(values[0]).toMatchObject({ type: 'success', title: 'Done' });
	});

	it('NotifyService keeps working on top of it', () => {
		const notify = TestBed.inject(NotifyService);
		notify.success('Created');
		notify.warn('Careful');
		notify.error('Failed', 'details');

		expect(toastr.show.mock.calls.map((c) => [c[1], c[2].status])).toEqual([
			['Created', 'success'],
			['Careful', 'warning'],
			['Failed', 'danger'],
		]);
		expect(toastr.show.mock.calls[2][0]).toBe('details');
	});
});
