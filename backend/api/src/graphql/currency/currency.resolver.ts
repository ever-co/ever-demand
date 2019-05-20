import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { ICurrencyCreateObject } from '@modules/server.common/interfaces/ICurrency';

@Resolver('Currency')
export class CurrencyResolver {
	@Query('currencies')
	async getCurrencies(_) {
		// TODO get all currencies and return them
		return [];
	}

	@Mutation()
	async createCurrency(
		_,
		{ createInfo }: { createInfo: ICurrencyCreateObject }
	) {
		// TODO create currency in DB and return it
		return;
	}
}
