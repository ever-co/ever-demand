import { ModelName, DBObject, Types, Schema } from '@pyro/db';
import { Entity, Column } from 'typeorm';
import ICurrency, { ICurrencyCreateObject } from '../interfaces/ICurrency';

/**
 * @class Currency
 * @extends {DBObject<ICurrency, ICurrencyCreateObject>}
 * @implements {ICurrency}
 */
@ModelName('Currency')
@Entity({ name: 'currencies' })
class Currency extends DBObject<ICurrency, ICurrencyCreateObject>
	implements ICurrency {
	/**
	 * Currency Code
	 *
	 * @type {string}
	 * @memberof Currency
	 */
	@Schema({ type: String, unique: true })
	@Column()
	currencyCode: string;

	/**
	 * Is Currency removed completely from the system
	 *
	 * @type {boolean}
	 * @memberof Currency
	 */
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Currency;

export const countriesDefaultCurrencies = {
	IL: 'ILS',
	RU: 'RUB',
	US: 'USD',
	BG: 'BGN',
};
