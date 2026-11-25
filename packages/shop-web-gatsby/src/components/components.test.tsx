import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { navigate } from 'gatsby';
import { order, productInfo, renderWithApp } from '../test/render';
import ProductCard from './ProductCard/ProductCard';
import ProductGrid from './ProductGrid/ProductGrid';
import Order from './Order/Order';
import OrdersList, { ordersTotal } from './OrdersList/OrdersList';
import GeoLoginForm from './GeoLoginForm/GeoLoginForm';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';
import Layout from './layout';
import Seo from './seo';
import LoginHeader from './LoginHeader/LoginHeader';
import ProductDetails from './ProductDetails/ProductDetails';

describe('ProductCard', () => {
	it('shows the product and its price', () => {
		renderWithApp(
			<ProductCard
				item={productInfo('1', 'Pizza', 9.5)}
				addToCart={() => {}}
			/>,
		);

		expect(screen.getByRole('heading', { name: 'Pizza' })).toBeTruthy();
		expect(screen.getByText('Pizza description')).toBeTruthy();
		expect(screen.getByRole('img', { name: 'Pizza' }).getAttribute('src')).toBe(
			'1.png',
		);
		expect(screen.getByRole('button', { name: 'Buy for: $9.50' })).toBeTruthy();
	});

	it('buys the product and opens its details', () => {
		const item = productInfo('1', 'Pizza');
		const addToCart = vi.fn();
		renderWithApp(<ProductCard item={item} addToCart={addToCart} />);

		fireEvent.click(screen.getByRole('button', { name: /Buy for/ }));
		fireEvent.click(screen.getByRole('button', { name: 'Details' }));

		expect(addToCart).toHaveBeenCalledWith(item);
		expect(navigate).toHaveBeenCalledWith('/products/p-1');
	});
});

describe('ProductGrid', () => {
	it('shows a card per product', () => {
		renderWithApp(
			<ProductGrid
				geoLocationProductsByPaging={[
					productInfo('1', 'Pizza'),
					productInfo('2', 'Sushi'),
				]}
				addToCart={() => {}}
			/>,
		);

		expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual([
			'Pizza',
			'Sushi',
		]);
	});
});

describe('Order and OrdersList', () => {
	it('shows the product, number and status of an order', () => {
		renderWithApp(<Order order={order('o7', 'Pizza', 12)} />);

		expect(screen.getByRole('heading', { name: 'Pizza' })).toBeTruthy();
		expect(screen.getByText('Order #: 7')).toBeTruthy();
		expect(screen.getByText('status: 0')).toBeTruthy();
	});

	it('lists every order and sums their prices', () => {
		const orders = [order('o1', 'Pizza', 12), order('o2', 'Sushi', 3.5)];
		renderWithApp(<OrdersList orders={orders} />);

		expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2);
		expect(ordersTotal(orders)).toBe(15.5);
		expect(ordersTotal([])).toBe(0);
	});
});

describe('GeoLoginForm', () => {
	it('reports the typed address fields', () => {
		const changed: [string, unknown][] = [];
		const handleChange =
			(name: string) => (event: { target: { value: any } }) =>
				changed.push([name, event.target.value]);
		renderWithApp(
			<GeoLoginForm
				state={{
					city: '',
					house: '',
					streetAddress: '',
					apartment: '',
					geoLocation: { countryId: 0 },
				}}
				handleChange={handleChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('City'), {
			target: { value: 'Sofia' },
		});
		fireEvent.change(screen.getByLabelText('House Number'), {
			target: { value: '1' },
		});
		fireEvent.change(screen.getByLabelText('Street Address'), {
			target: { value: 'Vitosha' },
		});

		expect(changed).toEqual([
			['city', 'Sofia'],
			['house', '1'],
			['streetAddress', 'Vitosha'],
		]);
	});

	it('picks the country from the list', () => {
		const handleChange = vi.fn().mockReturnValue(() => {});
		renderWithApp(
			<GeoLoginForm
				state={{
					city: '',
					house: '',
					streetAddress: '',
					apartment: '',
					geoLocation: { countryId: 0 },
				}}
				handleChange={handleChange}
			/>,
		);

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Bulgaria' }));

		expect(handleChange).toHaveBeenCalledWith('countryId');
	});
});

describe('Map', () => {
	it('shows the coordinates instead of a map without an API key', () => {
		renderWithApp(<Map coords={[42.6459136, 23.3332736]} apiKey="" />);

		expect(screen.getByTestId('map-placeholder').textContent).toBe(
			'42.64591, 23.33327',
		);
	});
});

describe('NavBar and Layout', () => {
	it('switches to delivery only', () => {
		const setDeliveryOnly = vi.fn();
		renderWithApp(<NavBar siteTitle="Ever Shop" />, {
			context: { setDeliveryOnly },
		});

		fireEvent.click(screen.getByRole('switch', { name: 'Delivery only' }));

		expect(setDeliveryOnly).toHaveBeenCalledWith(true);
	});

	it('opens home, orders and settings', () => {
		renderWithApp(<NavBar siteTitle="Ever Shop" />);

		fireEvent.click(screen.getByRole('button', { name: 'Ever Shop' }));
		fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

		expect(navigate).toHaveBeenCalledWith('/');
		expect(navigate).toHaveBeenCalledWith('/settings');
		expect(
			screen.getByRole('link', { name: 'Orders' }).getAttribute('href'),
		).toBe('/orders');
	});

	it('frames a page with the bar and the footer', () => {
		renderWithApp(
			<Layout>
				<p>page</p>
			</Layout>,
		);

		expect(screen.getByRole('main').textContent).toBe('page');
		expect(screen.getByRole('contentinfo').textContent).toContain('Built with');
	});
});

describe('Seo', () => {
	it('renders the head tags of a page', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		renderWithApp(<Seo title="Orders" keywords={['ever']} />);

		// React 19 hoists <title> and <meta> into the document head
		expect(document.title).toBe('Orders | Ever Shop');
		expect(
			document.head
				.querySelector('meta[name="keywords"]')
				?.getAttribute('content'),
		).toBe('ever');
		expect(
			document.head
				.querySelector('meta[name="description"]')
				?.getAttribute('content'),
		).toContain('Ever Demand web shop');
		vi.restoreAllMocks();
	});
});

describe('LoginHeader', () => {
	it('shows the title and the slogan', () => {
		renderWithApp(
			<LoginHeader
				title="What is your address?"
				subtitle="Relevant"
				logo="logo.svg"
			/>,
		);

		expect(
			screen.getByRole('heading', { name: 'What is your address?' }),
		).toBeTruthy();
		expect(screen.getByRole('img', { name: 'Ever' })).toBeTruthy();
	});
});

describe('ProductDetails', () => {
	const product = {
		__typename: 'Product' as const,
		id: 'p1',
		title: [{ locale: 'en-US', value: 'Pizza' }],
		description: [{ locale: 'en-US', value: 'Hot' }],
		descriptionHTML: [],
		details: [{ locale: 'en-US', value: 'Tomato' }],
		images: [
			{ locale: 'en-US', url: 'a.png', width: 1, height: 1, orientation: 1 },
			{ locale: 'en-US', url: 'b.png', width: 1, height: 1, orientation: 2 },
		],
		categories: [],
	};

	it('shows the product and switches the big image from a thumbnail', () => {
		renderWithApp(<ProductDetails product={product as any} />);

		expect(screen.getByRole('heading', { name: 'Pizza' })).toBeTruthy();
		expect(screen.getByText('Tomato')).toBeTruthy();
		const big = screen.getAllByRole('img', { name: 'Pizza' })[0];
		expect(big.getAttribute('src')).toBe('a.png');

		fireEvent.click(screen.getByRole('img', { name: 'Pizza 2' }));

		expect(
			screen.getAllByRole('img', { name: 'Pizza' })[0].getAttribute('src'),
		).toBe('b.png');
	});
});
