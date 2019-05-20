import { ModelName, DBObject, Types } from '@pyro/db';
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
	@Types.String()
	@Column()
	currencyCode: string;
}

export default Currency;
