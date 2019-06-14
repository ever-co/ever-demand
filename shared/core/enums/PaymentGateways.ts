/**
 * Payment Gateways
 *
 * @enum {number}
 */
enum PaymentGateways {
	Stripe,
	PayPal
}

export function paymentGatewaysToString(
	paymentGateway: PaymentGateways
): string {
	switch (paymentGateway) {
		case PaymentGateways.Stripe:
			return 'Stripe';
		case PaymentGateways.PayPal:
			return 'PayPal';
		default:
			return 'BAD_PAYMENT_GATEWAY';
	}
}

export default PaymentGateways;
