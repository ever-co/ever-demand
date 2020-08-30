import { ModelName, DBObject, Types, Schema } from '@pyro/db';
import IPaymentGatewayCreateObject, {
	IPaymentGateway,
} from '../interfaces/IPaymentGateway';
import PaymentGateways from '../enums/PaymentGateways';
import { Column } from 'typeorm';

/**
 * Stores type of payment gateway and configuration object for such payment gateway
 *
 * @class PaymentGateway
 * @extends {DBObject<IPaymentGateway, IPaymentGatewayCreateObject>}
 * @implements {IPaymentGateway}
 */
@ModelName('PaymentGateway')
class PaymentGateway
	extends DBObject<IPaymentGateway, IPaymentGatewayCreateObject>
	implements IPaymentGateway {
	/**
	 * Type of the payment gateway
	 *
	 * @type {PaymentGateways}
	 * @memberof PaymentGateway
	 */
	@Types.Number()
	@Column()
	paymentGateway: PaymentGateways;

	/**
	 * Configuration object for such payment gateway.
	 *
	 * Note: this field has no concrete type, because different payment gateways
	 * may have different fields in the configure object
	 *
	 * @type {any}
	 * @memberof PaymentGateway
	 */
	@Schema({ type: Object })
	@Column()
	configureObject: any;
}

export default PaymentGateway;
