import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { of } from 'rxjs';
import { RegistrationSystem } from '../domain/enums';
import * as fx from '../test/fixtures';
import { createMockGraphQL, createMockRouters, createTestServices, renderApp, visitorSession } from '../test/harness';

describe('Invite by code', () => {
	it('shows the code input and the "sign up by address" option', async () => {
		await renderApp({ route: 'InviteByCode', session: visitorSession });
		expect(await screen.findByTestId('invite-by-code-screen')).toBeTruthy();
		expect(screen.getByText('Sign up by Address')).toBeTruthy();
		expect(screen.getByPlaceholderText('Invite Code')).toBeTruthy();
	});

	it('registers with a valid code and opens the products', async () => {
		const routers = createMockRouters({ invite: { getByCode: jest.fn(() => of(fx.invite)) } });
		const { store } = await renderApp({ route: 'InviteByCode', session: visitorSession, services: createTestServices({ routers }) });

		await fireEvent.changeText(await screen.findByTestId('invite-code-input'), '1234');

		await waitFor(() => expect(store.getState().session.userId).toBe('user-1'));
		expect(routers.invite.getByCode).toHaveBeenCalledWith({ location: undefined, inviteCode: '1234' });
		expect(routers.userAuth.register).toHaveBeenCalledWith({
			user: { apartment: fx.invite.apartment, geoLocation: fx.invite.geoLocation },
		});
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});

	it('says "Wrong code!" when there is no invite', async () => {
		const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
		const routers = createMockRouters();
		await renderApp({ route: 'InviteByCode', session: visitorSession, services: createTestServices({ routers }) });
		await fireEvent.changeText(await screen.findByTestId('invite-code-input'), '4321');
		await waitFor(() => expect(alert).toHaveBeenCalledWith('', 'Wrong code!'));
		expect(routers.userAuth.register).not.toHaveBeenCalled();
	});

	it('the dev invite code registers at the fake invite and seeds 40 orders', async () => {
		const graphql = createMockGraphQL();
		const routers = createMockRouters();
		await renderApp({ route: 'InviteByCode', session: visitorSession, services: createTestServices({ routers, graphql }) });
		await fireEvent.changeText(await screen.findByTestId('invite-code-input'), '8321');
		await waitFor(() => expect(graphql.generateOrdersByCustomerId).toHaveBeenCalledWith(40, 'user-1'));
		expect(routers.invite.getByCode).not.toHaveBeenCalled();
		const registered = (routers.userAuth.register as jest.Mock).mock.calls[0][0];
		expect(registered.user.geoLocation).toMatchObject({ city: 'Sofia', countryId: 21 });
	});

	it('after an invite request it shows the address that waits for a code', async () => {
		await renderApp({
			route: 'InviteByCode',
			session: { ...visitorSession, inviteRequestId: 'request-1', inviteAddress: 'Main 1/2, Sofia' },
		});
		expect(await screen.findByTestId('invite-address')).toHaveTextContent('Main 1/2, Sofia');
		expect(screen.queryByTestId('get-in-by-address-button')).toBeNull();
	});

	it('goes back to the product details that sent the visitor here', async () => {
		const routers = createMockRouters({ invite: { getByCode: jest.fn(() => of(fx.invite)) } });
		const { store } = await renderApp({
			route: 'InviteByCode',
			session: { ...visitorSession, registrationSystem: RegistrationSystem.Once, backToDetails: 'product-1', warehouseId: 'warehouse-1' },
			services: createTestServices({ routers }),
		});
		await fireEvent.changeText(await screen.findByTestId('invite-code-input'), '1234');
		expect(await screen.findByTestId('product-details-screen')).toBeTruthy();
		expect(store.getState().session.backToDetails).toBeNull();
	});

	it('the guard sends a registered customer to the products', async () => {
		await renderApp({ route: 'InviteByCode', session: { ...visitorSession, userId: 'user-1' } });
		expect(await screen.findByTestId('products-screen')).toBeTruthy();
	});
});

describe('Invite by location', () => {
	it('prefills the address from the coordinates and registers when an invite exists', async () => {
		const routers = createMockRouters({
			geoLocation: {
				getAddressByCoordinatesUsingArcGIS: jest.fn(async () => ({ locality: 'Sofia', thoroughfare: 'Vitosha', country: 'BG' })),
			},
			invite: { getByLocation: jest.fn(() => of(fx.invite)) },
		});
		const { store } = await renderApp({ route: 'InviteByLocation', session: { ...visitorSession, inviteSystem: false }, services: createTestServices({ routers }) });

		expect(await screen.findByDisplayValue('Sofia')).toBeTruthy();
		expect(screen.getByDisplayValue('Vitosha')).toBeTruthy();
		expect(screen.getByDisplayValue('Bulgaria')).toBeTruthy();
		expect(routers.geoLocation.getAddressByCoordinatesUsingArcGIS).toHaveBeenCalledWith(42.6459136, 23.3332736);

		await fireEvent.changeText(screen.getByTestId('house-input'), '12');
		await fireEvent.changeText(screen.getByTestId('apartment-input'), '4');
		await fireEvent.press(screen.getByTestId('get-in-button'));

		await waitFor(() => expect(store.getState().session.userId).toBe('user-1'));
		expect(routers.invite.getByLocation).toHaveBeenCalledWith({
			apartment: '4',
			house: '12',
			streetAddress: 'Vitosha',
			city: 'Sofia',
			countryId: 21,
			notes: '',
		});
	});

	it('without an invite (invite system on) it asks for one and waits for the code', async () => {
		const routers = createMockRouters();
		const { store } = await renderApp({ route: 'InviteByLocation', session: visitorSession, services: createTestServices({ routers }) });

		await screen.findByTestId('city-input');
		await fireEvent.changeText(screen.getByTestId('city-input'), 'Sofia');
		await fireEvent.changeText(await screen.findByTestId('street-input'), 'Simeonovsko shose');
		await fireEvent.changeText(await screen.findByTestId('house-input'), '104');
		await fireEvent.press(screen.getByTestId('no-apartment-toggle'));
		await fireEvent.press(await screen.findByTestId('get-in-button'));

		await waitFor(() => expect(store.getState().session.inviteRequestId).toBe('request-1'));
		expect(routers.inviteRequest.create).toHaveBeenCalledWith(
			expect.objectContaining({ apartment: '0', deviceId: 'device-1', geoLocation: expect.objectContaining({ city: 'Sofia', house: '104' }) }),
		);
		expect(store.getState().session.inviteAddress).toBe('Simeonovsko shose 104/3, Sofia');
		expect(await screen.findByTestId('invite-requested')).toBeTruthy();
	});

	it('without an invite (invite system off) it creates the invite and registers', async () => {
		const routers = createMockRouters();
		const { store } = await renderApp({ route: 'InviteByLocation', session: { ...visitorSession, inviteSystem: false }, services: createTestServices({ routers }) });
		await fireEvent.changeText(await screen.findByTestId('city-input'), 'Sofia');
		await fireEvent.changeText(await screen.findByTestId('street-input'), 'Main');
		await fireEvent.changeText(await screen.findByTestId('house-input'), '1');
		await fireEvent.changeText(screen.getByTestId('apartment-input'), '2');
		await fireEvent.press(await screen.findByTestId('get-in-button'));
		await waitFor(() => expect(store.getState().session.userId).toBe('user-1'));
		expect(routers.invite.create).toHaveBeenCalled();
	});
});
