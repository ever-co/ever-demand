import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { ICurrencyCreateObject } from '@modules/server.common/interfaces/ICurrency';
import { CurrenciesService } from '../../services/currency/CurrencyService';

@Resolver('Currency')
export class CurrencyResolver {
	constructor(private readonly _currenciesService: CurrenciesService) {}

	@Query('currencies')
	async getCurrencies(_) {
		return this._currenciesService.getAllCurrencies();
	}

	@Mutation()
	async createCurrency(
		_,
		{ createInput }: { createInput: ICurrencyCreateObject }
	) {
		return this._currenciesService.createCurrency(createInput);
	}
}
