import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { navigate } from 'gatsby';
import { order, productInfo, renderWithApp } from './render';
import { GeoLocationProductsByPaging, ProductQuery } from '../apollo/product';
import { CreateOrder, GetOrders } from '../apollo/order';
import { CreateUser } from '../apollo/user';
import IndexPage from '../pages/index';
import OrdersPage from '../pages/orders';
import LoginPage from '../pages/login';
import SettingsPage from '../pages/settings';
import NotFoundPage from '../pages/404';
import ProductPage from '../pages/products/[id]';
import { getlocale } from '../auth/auth';

const productsMock = (products: object[]) => ({
	request: {
		query: GeoLocationProductsByPaging,
		variables: {
			geoLocation: {
				loc: { type: 'Point', coordinates: [23.3332736, 42.6459136] },
			},
		},
	},
	result: { data: { geoLocationProductsByPaging: products } },
	maxUsageCount: Number.POSITIVE_INFINITY,
});

describe('products page', () => {
	it('lists the products around the visitor (longitude, latitude)', async () => {
		renderWithApp(<IndexPage />, {
			mocks: [
				productsMock([productInfo('1', 'Pizza'), productInfo('2', 'Sushi')]),
			],
		});

		expect(await screen.findByRole('heading', { name: 'Pizza' })).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Sushi' })).toBeTruthy();
	});

	it('shows only delivered products in delivery-only mode', async () => {
		const takeaway = productInfo('2', 'Sushi');
		takeaway.warehouseProduct.isDeliveryRequired = false;
		renderWithApp(<IndexPage />, {
			mocks: [productsMock([productInfo('1', 'Pizza'), takeaway])],
			context: { deliveryOnly: true },
		});

		expect(await screen.findByRole('heading', { name: 'Pizza' })).toBeTruthy();
		expect(screen.queryByRole('heading', { name: 'Sushi' })).toBeNull();
	});

	it('waits for the visitor location', () => {
		renderWithApp(<IndexPage />, { context: { coordinates: null } });

		expect(screen.getByText('Loading...')).toBeTruthy();
	});

	it('buys a product, keeps the order and opens the orders', async () => {
		localStorage.setItem('user', JSON.stringify({ id: 'u1' }));
		const setOrders = vi.fn();
		const created = order('o9', 'Pizza', 10);
		renderWithApp(<IndexPage />, {
			context: { setOrders },
			mocks: [
				productsMock([productInfo('1', 'Pizza')]),
				{
					request: {
						query: CreateOrder,
						variables: {
							createInput: {
								userId: 'u1',
								warehouseId: 'w-1',
								products: [{ productId: 'p-1', count: 1 }],
							},
						},
					},
					result: { data: { createOrder: created } },
				},
			],
		});

		fireEvent.click(await screen.findByRole('button', { name: /Buy for/ }));

		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/orders'));
		expect(setOrders).toHaveBeenCalledWith([
			expect.objectContaining({ id: 'o9' }),
		]);
	});
});

describe('orders page', () => {
	it('lists the orders of the customer with the total to pay', async () => {
		localStorage.setItem('user', JSON.stringify({ id: 'u1' }));
		renderWithApp(<OrdersPage />, {
			mocks: [
				{
					request: { query: GetOrders, variables: { id: 'u1' } },
					result: {
						data: {
							getOrders: [order('o1', 'Pizza', 12), order('o2', 'Sushi', 3)],
						},
					},
				},
			],
		});

		expect(await screen.findByRole('heading', { name: 'Pizza' })).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Sushi' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Pay Now: $15' })).toBeTruthy();
	});
});

describe('login page', () => {
	it('registers the customer with the address and opens the products', async () => {
		const setUser = vi.fn();
		renderWithApp(<LoginPage />, {
			context: { setUser },
			mocks: [
				{
					request: {
						query: CreateUser,
						variables: {
							user: {
								apartment: '0',
								geoLocation: {
									loc: { type: 'Point', coordinates: [23.3332736, 42.6459136] },
									city: 'Sofia',
									countryId: 0,
									house: '1',
									streetAddress: 'Vitosha',
								},
							},
							password: '',
						},
					},
					result: { data: { registerUser: { __typename: 'User', id: 'u42' } } },
				},
			],
		});

		fireEvent.change(screen.getByLabelText('City'), {
			target: { value: 'Sofia' },
		});
		fireEvent.change(screen.getByLabelText('House Number'), {
			target: { value: '1' },
		});
		fireEvent.change(screen.getByLabelText('Street Address'), {
			target: { value: 'Vitosha' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
		expect(setUser).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'u42' }),
		);
		expect(
			screen.getByRole('heading', { name: 'What is your address?' }),
		).toBeTruthy();
	});
});

describe('settings page', () => {
	it('saves the chosen locale', () => {
		renderWithApp(<SettingsPage />);

		fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Language' }));
		fireEvent.click(screen.getByRole('option', { name: 'bg-BG' }));
		expect(getlocale()).toBe('en-US');

		fireEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(getlocale()).toBe('bg-BG');
		expect(screen.getByText('Saved')).toBeTruthy();
	});
});

describe('product page', () => {
	it('loads the product of the url', async () => {
		renderWithApp(<ProductPage {...({ params: { id: 'p1' } } as any)} />, {
			mocks: [
				{
					request: { query: ProductQuery, variables: { id: 'p1' } },
					result: {
						data: {
							product: {
								__typename: 'Product',
								id: 'p1',
								title: [
									{
										__typename: 'TranslateType',
										locale: 'en-US',
										value: 'Pizza',
									},
								],
								description: [
									{
										__typename: 'TranslateType',
										locale: 'en-US',
										value: 'Hot',
									},
								],
								descriptionHTML: [],
								details: [
									{
										__typename: 'TranslateType',
										locale: 'en-US',
										value: 'Tomato',
									},
								],
								images: [
									{
										__typename: 'ImageType',
										locale: 'en-US',
										url: 'a.png',
										width: 1,
										height: 1,
										orientation: 1,
									},
								],
								categories: [],
							},
						},
					},
				},
			],
		});

		expect(await screen.findByRole('heading', { name: 'Pizza' })).toBeTruthy();
	});

	it('says when the product does not exist', async () => {
		renderWithApp(<ProductPage {...({ params: { id: 'gone' } } as any)} />, {
			mocks: [
				{
					request: { query: ProductQuery, variables: { id: 'gone' } },
					result: { data: { product: null } },
				},
			],
		});

		expect(await screen.findByText('Product not found.')).toBeTruthy();
	});
});

describe('404 page', () => {
	it('says the page does not exist', () => {
		renderWithApp(<NotFoundPage />);

		expect(screen.getByRole('heading', { name: 'NOT FOUND' })).toBeTruthy();
	});
});
