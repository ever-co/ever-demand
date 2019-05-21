import Currency from '@modules/server.common/entities/Currency';
import { injectable } from 'inversify';
import { routerName } from '@pyro/io';
import { DBService } from '@pyro/db-server';
import IService from 'services/IService';
import { ICurrencyCreateObject } from '@modules/server.common/interfaces/ICurrency';
import { createEverLogger } from '../../helpers/Log';

export interface CurrencyMutationRespone {
	success: boolean;
	message?: string;
	data?: Currency;
}

@injectable()
@routerName('currency')
export class CurrenciesService extends DBService<Currency> implements IService {
	public readonly DBObject = Currency;

	protected readonly log = createEverLogger({ name: 'currenciesService' });

	async createCurrency(
		currency: ICurrencyCreateObject
	): Promise<CurrencyMutationRespone> {
		let success, message, data;

		try {
			data = await this.create(currency);
			success = true;
			message = `Successfully create currency ${data.currencyCode}`;
		} catch (error) {
			success = false;
			message = error.message;
		}

		return { success, message, data };
	}

	async getAllCurrencies(): Promise<Currency[]> {
		const currencies = await this.find({
			isDeleted: { $eq: false }
		});

		return currencies;
	}
}
