import { getIdFromTheDate } from '../../../../common/src/utils';

const makeOrder = (createdAt: Date | string | undefined, orderNumber: number) =>
	({ createdAt, orderNumber } as any);

describe('getIdFromTheDate', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('formats day, month and year followed by the order number', () => {
		// local-time constructor so the result does not depend on the TZ of the machine
		const createdAt = new Date(2026, 10, 12, 10, 30, 0);

		expect(getIdFromTheDate(makeOrder(createdAt, 5))).toBe('12112026-5');
	});

	it('zero-pads single digit day and month', () => {
		const createdAt = new Date(2026, 0, 3, 10, 30, 0);

		expect(getIdFromTheDate(makeOrder(createdAt, 12))).toBe('03012026-12');
	});

	it('accepts createdAt as an ISO string', () => {
		const createdAt = new Date(2026, 10, 12, 12, 0, 0).toISOString();

		expect(getIdFromTheDate(makeOrder(createdAt, 7))).toBe('12112026-7');
	});

	it('does not depend on the runtime locale (month/day first)', () => {
		jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue(
			'11/12/2026'
		);
		const createdAt = new Date(2026, 10, 12, 10, 30, 0);

		expect(getIdFromTheDate(makeOrder(createdAt, 5))).toBe('12112026-5');
	});

	it('does not depend on the runtime locale (dot separated)', () => {
		jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue(
			'12.11.2026'
		);
		const createdAt = new Date(2026, 10, 12, 10, 30, 0);

		expect(getIdFromTheDate(makeOrder(createdAt, 5))).toBe('12112026-5');
	});

	it('throws when createdAt is missing', () => {
		expect(() => getIdFromTheDate(makeOrder(undefined, 5))).toThrow();
	});

	it('throws when orderNumber is missing', () => {
		expect(() => getIdFromTheDate(makeOrder(new Date(), 0))).toThrow();
	});
});
