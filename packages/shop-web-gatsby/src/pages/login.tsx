import React, { useState } from 'react';
import { Box, Button, Card, Grid } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { navigate } from 'gatsby';

import logo from '../assets/ever-logo.svg';
import * as styles from '../styles/styles.module.scss';
import LoginHeader from '../components/LoginHeader/LoginHeader';
import Seo from '../components/seo';
import GeoLoginForm, {
	type AddressState,
} from '../components/GeoLoginForm/GeoLoginForm';
import Map from '../components/Map';
import { useAppContext } from '../Context';
import { toUserInput } from '../utilities/user';
import { CreateUser } from '../apollo/user';

const defaultUser: AddressState = {
	email: '',
	firstName: '',
	lastName: '',
	phone: '',
	apartment: '',
	city: '',
	house: '',
	postcode: '',
	streetAddress: '',
	geoLocation: { countryId: 0 },
};

/** Sign-up by address: registers the customer, then opens the products. */
const LoginPage = () => {
	const context = useAppContext();
	const [state, setState] = useState<AddressState>({ ...defaultUser });
	const [registerUser, { loading }] = useMutation(CreateUser);

	const handleChange =
		(name: string) => (event: { target: { value: any } }) => {
			const value = event.target.value;
			setState((current) =>
				name === 'countryId'
					? {
							...current,
							geoLocation: { ...current.geoLocation, countryId: value },
						}
					: { ...current, [name]: value },
			);
		};

	const submit = async () => {
		const { data } = await registerUser({
			variables: {
				user: toUserInput(state, context.coordinates),
				password: '',
			},
		});
		if (data) {
			context.setUser(data.registerUser);
			navigate('/');
		}
	};

	return (
		<Box className={styles.auth}>
			<Box sx={{ mb: 1, p: 1 }}>
				<LoginHeader
					title={'What is your address?'}
					subtitle={
						'We guarantee to only show products relevent to your location.'
					}
					logo={logo}
				/>
			</Box>
			<br />
			<Box sx={{ mt: 2 }}>
				<Grid
					sx={{ justifyContent: 'center', alignItems: 'center' }}
					container
					spacing={6}
				>
					<Grid size={{ xs: 12, md: 6, lg: 4, xl: 3 }} sx={{ pt: 0 }}>
						<Card className={styles.card}>
							<GeoLoginForm state={state} handleChange={handleChange} />

							<Box sx={{ mx: 3, mb: 2 }}>
								<Button
									color={'secondary'}
									variant={'contained'}
									disabled={loading}
									onClick={submit}
								>
									Submit
								</Button>
							</Box>
						</Card>
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
						<Box sx={{ p: [1, 2, 3, 4], mb: 4 }}>
							<Map
								coords={context.coordinates}
								className={styles.mapContainer}
							/>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};

export const Head = () => <Seo title="What is your address?" />;

export default LoginPage;
