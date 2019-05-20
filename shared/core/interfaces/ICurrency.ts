import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

export interface ICurrencyCreateObject extends DBCreateObject {
	currencyCode: string;
}

interface ICurrency extends ICurrencyCreateObject, DBRawObject {
	_id: PyroObjectId;
}

export default ICurrency;
