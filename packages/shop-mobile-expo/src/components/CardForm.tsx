/**
 * New-card form (native): Stripe's `CardField` and `createToken({ type: 'Card' })`. The token goes
 * to `user.addPaymentMethod` like the Stripe Checkout token of the Ionic app.
 */
import { CardField, StripeProvider, createToken } from '@stripe/stripe-react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export interface CardFormHandle {
	/** A card token id, or null with the reason when the card is incomplete or refused. */
	createToken(email: string): Promise<{ id: string | null; error?: string }>;
}

export const CardForm = forwardRef<CardFormHandle, { publishableKey: string }>(function CardForm(
	{ publishableKey },
	ref,
) {
	const [complete, setComplete] = useState(false);

	useImperativeHandle(ref, () => ({
		async createToken() {
			if (!complete) {
				return { id: null, error: 'incomplete' };
			}
			const result = await createToken({ type: 'Card' });
			return result.error ? { id: null, error: result.error.message } : { id: result.token?.id ?? null };
		},
	}));

	return (
		<StripeProvider publishableKey={publishableKey}>
			<View style={styles.container}>
				<CardField
					postalCodeEnabled={false}
					style={styles.field}
					cardStyle={{ backgroundColor: colors.white, textColor: colors.dark }}
					onCardChange={(details) => setComplete(details.complete)}
					testID='card-field'
				/>
			</View>
		</StripeProvider>
	);
});

const styles = StyleSheet.create({
	container: { paddingVertical: 8 },
	field: { width: '100%', height: 50 },
});
