/** Renders a page or component inside the app context, with mocked GraphQL responses. */
import React, { type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { AppContext, type AppContextValue } from '../Context';
import auth from '../auth/auth';
import theme from '../theme';

export function contextValue(
	overrides: Partial<AppContextValue> = {},
): AppContextValue {
	return {
		...auth,
		coordinates: [42.6459136, 23.3332736],
		setCoordinates: () => {},
		deliveryOnly: false,
		setDeliveryOnly: () => {},
		orders: [],
		setOrders: () => {},
		...overrides,
	};
}

export function renderWithApp(
	ui: ReactNode,
	{
		mocks = [],
		context = {},
	}: {
		mocks?: MockLink.MockedResponse[];
		context?: Partial<AppContextValue>;
	} = {},
) {
	const value = contextValue(context);
	const result = render(
		<MockedProvider mocks={mocks}>
			<AppContext.Provider value={value}>
				<ThemeProvider theme={theme}>{ui}</ThemeProvider>
			</AppContext.Provider>
		</MockedProvider>,
	);
	return { ...result, context: value };
}

const text = (value: string) => [
	{ __typename: 'TranslateType', locale: 'en-US', value },
];

/** A product of the geoLocationProductsByPaging query. */
export function productInfo(id: string, title: string, price = 10) {
	return {
		__typename: 'ProductInfo',
		distance: 1,
		warehouseId: `w-${id}`,
		warehouseLogo: 'logo.png',
		warehouseProduct: {
			__typename: 'WarehouseProduct',
			id: `wp-${id}`,
			price,
			initialPrice: price + 2,
			count: 5,
			soldCount: 0,
			product: {
				__typename: 'Product',
				id: `p-${id}`,
				title: text(title),
				description: text(`${title} description`),
				details: text(`${title} details`),
				images: [
					{
						__typename: 'ImageType',
						locale: 'en-US',
						url: `${id}.png`,
						width: 1,
						height: 1,
						orientation: 1,
					},
				],
			},
			isManufacturing: false,
			isCarrierRequired: false,
			isDeliveryRequired: true,
			isTakeaway: false,
			deliveryTimeMin: 20,
			deliveryTimeMax: 40,
		},
	};
}

/** An order of the getOrders / createOrder results. */
export function order(id: string, title: string, totalPrice: number) {
	return {
		__typename: 'Order',
		id,
		updatedAt: '2026-11-25T10:00:00.000Z',
		orderNumber: Number(id.replace(/\D/g, '') || 1),
		status: 0,
		totalPrice,
		products: [
			{
				__typename: 'OrderProduct',
				isTakeaway: false,
				price: totalPrice,
				product: {
					__typename: 'Product',
					images: [{ __typename: 'ImageType', url: `${id}.png` }],
					description: text(`${title} description`),
					details: text(`${title} details`),
					title: text(title),
				},
			},
		],
	};
}
