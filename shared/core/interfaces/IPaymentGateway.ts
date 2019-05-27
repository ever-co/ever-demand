import PaymentGateways from '../enums/PaymentGateways';
import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

export interface IPaymentGatewayCreateObject extends DBCreateObject {
	paymentGateway: PaymentGateways;
	configureObject: any;
}

export interface IPaymentGateway
	extends DBRawObject,
		IPaymentGatewayCreateObject {
	_id: PyroObjectId;
	_createdAt: Date | string;
	_updatedAt: Date | string;
}

export default IPaymentGatewayCreateObject;
