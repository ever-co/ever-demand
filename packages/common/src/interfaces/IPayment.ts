export interface IMercadoSavedCard {
	id: string;
	first_six_digits: string;
	last_four_digits: string;
	customer_id: string;
	date_created: string;
	date_last_updated: string;
	expiration_month: string;
	expiration_year: string;
	cardholder: {
		identification: {
			number: string;
			type: string;
		};
		name: string;
	};
	issuer: {
		id: number;
		name: string;
	};
	payment_method: IMercadoPaymentMethod;
	security_code: {
		length: number;
		card_location: string;
	};
}

export interface IMercadoPaymentMethod {
	id: string;
	name: string;
	payment_type_id: string;
	secure_thumbnail: string;
	thumbnail: string;
}
