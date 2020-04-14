import { Injectable } from '@angular/core';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import faker from 'faker';
import _ from 'lodash';

enum IsDeliveryTakeawayStatus {
	Takeaway = 0,
	IsDeliveryRequired = 1,
	Both = 2,
}

interface IIsDeliveryTakeawayStates {
	0: IIsDeliveryTakeaway;
	1: IIsDeliveryTakeaway;
	2: IIsDeliveryTakeaway;
}

interface IIsDeliveryTakeaway {
	isDeliveryRequired: boolean;
	isTakeAway: boolean;
}

@Injectable()
export default class FakeDataWarehousesProducts {
	private _currentTakeawayDeliveryStatus: IsDeliveryTakeawayStatus =
		IsDeliveryTakeawayStatus.Takeaway;

	private _takeawayDeliveryOrBoth: IIsDeliveryTakeawayStates = {
		0: { isDeliveryRequired: false, isTakeAway: true },
		1: { isDeliveryRequired: true, isTakeAway: false },
		2: { isDeliveryRequired: true, isTakeAway: true },
	};

	getCreateObject(productId: string): IWarehouseProductCreateObject {
		const currentTakeawayDeliveryState: IIsDeliveryTakeaway = this._getCurrentWarehouseProductIsDeliveryTakeawayState();
		const price = this.getRandomPrice;

		return {
			product: productId,
			initialPrice: price,
			price,
			isCarrierRequired: true,
			isManufacturing: true,
			count: faker.random.number({ min: 1, max: 10 }),
			isDeliveryRequired: currentTakeawayDeliveryState.isDeliveryRequired,
			isTakeaway: currentTakeawayDeliveryState.isTakeAway,
		};
	}

	getHardcodedCreateObject(productIds: string[]) {
		const productCreateObjects: IWarehouseProductCreateObject[] = productIds.map(
			(id) => {
				const currentTakeawayDeliveryState: IIsDeliveryTakeaway = this._getCurrentWarehouseProductIsDeliveryTakeawayState();
				const price = this.getRandomPrice;

				return {
					product: id,
					initialPrice: price + _.random(20),
					price,
					isCarrierRequired: true,
					isManufacturing: true,
					count: 5,
					isDeliveryRequired:
						currentTakeawayDeliveryState.isDeliveryRequired,
					isTakeaway: currentTakeawayDeliveryState.isTakeAway,
				};
			}
		);

		return productCreateObjects;
	}

	private get getRandomPrice(): number {
		return 5 + faker.random.number(150);
	}

	private _setNextWarehouseProductIsDeliveryTakeawayStatus() {
		let result: IsDeliveryTakeawayStatus;

		switch (this._currentTakeawayDeliveryStatus) {
			case IsDeliveryTakeawayStatus.Takeaway:
				result = IsDeliveryTakeawayStatus.IsDeliveryRequired;
				break;

			case IsDeliveryTakeawayStatus.IsDeliveryRequired:
				result = IsDeliveryTakeawayStatus.Both;
				break;

			case IsDeliveryTakeawayStatus.Both:
				result = IsDeliveryTakeawayStatus.Takeaway;
				break;
		}

		this._currentTakeawayDeliveryStatus = result;
	}

	private _getCurrentWarehouseProductIsDeliveryTakeawayState(): IIsDeliveryTakeaway {
		const currentTakeawayDeliveryState = this._takeawayDeliveryOrBoth[
			this._currentTakeawayDeliveryStatus
		];

		this._setNextWarehouseProductIsDeliveryTakeawayStatus();

		return currentTakeawayDeliveryState;
	}
}
