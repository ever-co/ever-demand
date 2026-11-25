/**
 * New-card form (web): Stripe Elements' `CardElement` and `stripe.createToken(card)`. Stripe.js is
 * loaded only when the form opens and a publishable key is set.
 */
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export interface CardFormHandle {
	createToken(email: string): Promise<{ id: string | null; error?: string }>;
}

const stripes = new Map<string, Promise<Stripe | null>>();

function stripeFor(key: string) {
	let stripe = stripes.get(key);
	if (!stripe) {
		stripe = loadStripe(key);
		stripes.set(key, stripe);
	}
	return stripe;
}

const Inner = forwardRef<CardFormHandle>(function Inner(_, ref) {
	const stripe = useStripe();
	const elements = useElements();

	useImperativeHandle(ref, () => ({
		async createToken(email: string) {
			const card = elements?.getElement(CardElement);
			if (!stripe || !card) {
				return { id: null, error: 'not ready' };
			}
			const result = await stripe.createToken(card, { name: email });
			return result.error ? { id: null, error: result.error.message } : { id: result.token?.id ?? null };
		},
	}));

	return (
		<View style={styles.field} testID='card-field'>
			<CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '16px', color: '#222428' } } }} />
		</View>
	);
});

export const CardForm = forwardRef<CardFormHandle, { publishableKey: string }>(function CardForm(
	{ publishableKey },
	ref,
) {
	const stripe = useMemo(() => stripeFor(publishableKey), [publishableKey]);
	return (
		<Elements stripe={stripe}>
			<Inner ref={ref} />
		</Elements>
	);
});

const styles = StyleSheet.create({
	field: { backgroundColor: '#ffffff', padding: 12, borderRadius: 4, marginVertical: 8 },
});
