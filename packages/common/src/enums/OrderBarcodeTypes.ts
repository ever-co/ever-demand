/**
 * Order Barcode Types
 *
 * @enum {number}
 */
enum OrderBarcodeTypes {
	QR = 0,
	CODE128 = 1,
	CODE39 = 2,
	pharmacode = 3,
	MSI = 4,
}

export function orderBarcodeTypesToString(status: OrderBarcodeTypes): string {
	switch (status) {
		case OrderBarcodeTypes.QR:
			return 'QR code';
		case OrderBarcodeTypes.CODE128:
			return 'CODE128';
		case OrderBarcodeTypes.CODE39:
			return 'CODE39';
		case OrderBarcodeTypes.pharmacode:
			return 'pharmacode';
		case OrderBarcodeTypes.MSI:
			return 'MSI';
		default:
			return 'BAD_STATUS';
	}
}

export default OrderBarcodeTypes;
