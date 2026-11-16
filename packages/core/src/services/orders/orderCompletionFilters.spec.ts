import sift from 'sift';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import {
	isCompletedOrderFilter,
	isNotCompletedOrderFilter,
} from './orderCompletionFilters';

interface SampleOrder {
	isPaid: boolean;
	isCancelled: boolean;
	carrierStatus: OrderCarrierStatus;
}

const matches = (filter: object, order: SampleOrder): boolean =>
	sift(filter)(order);

const carrierStatuses = Object.values(OrderCarrierStatus).filter(
	(value): value is OrderCarrierStatus => typeof value === 'number'
);

const sampleOrders: [string, SampleOrder][] = [];

for (const isPaid of [false, true]) {
	for (const isCancelled of [false, true]) {
		for (const carrierStatus of carrierStatuses) {
			sampleOrders.push([
				`isPaid=${isPaid} isCancelled=${isCancelled} carrierStatus=${carrierStatus}`,
				{ isPaid, isCancelled, carrierStatus },
			]);
		}
	}
}

describe('order completion filters', () => {
	it('treat a paid, undelivered, not cancelled order as not completed', () => {
		const paidByCard: SampleOrder = {
			isPaid: true,
			isCancelled: false,
			carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
		};

		expect(matches(isNotCompletedOrderFilter, paidByCard)).toBe(true);
		expect(matches(isCompletedOrderFilter, paidByCard)).toBe(false);
	});

	it('build a sample order for every carrier status', () => {
		expect(carrierStatuses).toHaveLength(8);
		expect(sampleOrders).toHaveLength(2 * 2 * 8);
	});

	it.each(sampleOrders)(
		'%s matches exactly one filter',
		(_label, sampleOrder) => {
			const { isPaid, isCancelled, carrierStatus } = sampleOrder;
			const completed =
				(isPaid &&
					carrierStatus === OrderCarrierStatus.DeliveryCompleted) ||
				isCancelled;

			expect(matches(isCompletedOrderFilter, sampleOrder)).toBe(
				completed
			);
			expect(matches(isNotCompletedOrderFilter, sampleOrder)).toBe(
				!completed
			);
		}
	);
});
