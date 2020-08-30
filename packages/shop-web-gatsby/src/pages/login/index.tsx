import React, { useContext, useState } from 'react';
import Header from './Header';
import logo from '../../assets/ever-logo.svg';
import styles from '../../styles/styles.module.scss';
import { Box, Button, Card, Grid } from '@material-ui/core';
import GeoLoginForm from '../../components/GeoLoginForm';
import Map from '../../components/Map';
import { AppContext } from '../../Context';
import { useMutation } from 'react-apollo-hooks';
import { CreateUser } from '../../apollo/user';
import { navigate } from '@reach/router';

const defaultUser = {
	email: '',
	firstName: '',
	lastName: '',
	phone: '',
	apartment: '',
	geoLocation: {
		loc: {
			type: 'Point',
			coordinates: null,
		},
		countryId: 0,
		house: '',
		postcode: '',
		streetAddress: '',
		city: '',
	},
};

const page = () => {
	const context = useContext(AppContext);
	const [state, setState] = useState({ ...defaultUser });
	const handleChange = (name: string) => (event: {
		target: { value: any };
	}) => {
		if (name === 'countryId') {
			let newState = { ...state };
			newState.geoLocation.countryId = event.target.value;
			setState(newState);
		} else {
			setState({ ...state, [name]: event.target.value });
		}
	};
	const formatUser = () => {
		let user = {
			email: state.email,
			firstName: state.firstName,
			lastName: state.lastName,
			phone: state.phone,
			geoLocation: {
				loc: {
					type: 'Point',
					coordinates: context.coordinates,
				},
				city: state.city,
				countryId: state.geoLocation.countryId,
				house: state.house,
				postcode: state.postcode,
				streetAddress: state.streetAddress,
			},
			apartment: state.apartment,
		};

		return user;
	};
	const submit = useMutation(CreateUser, {
		variables: { user: formatUser(), password: '' },
	});
	return (
		<Box className={styles.auth}>
			<Box marginBottom={1} padding={1}>
				<Header
					title={'What is your address?'}
					subtitle={
						'We guarantee to only show products relevent to your location.'
					}
					logo={logo}
				/>
			</Box>
			<br />
			<Box marginTop={2}>
				<Grid container justify={'center'} spacing={6} alignItems={'center'}>
					<Grid item xs md={6} lg={4} xl={3} style={{ paddingTop: 0 }}>
						<Card className={styles.card}>
							<GeoLoginForm state={state} handleChange={handleChange} />

							<Box mx={3}>
								<Button
									color={'secondary'}
									variant={'contained'}
									onClick={() => {
										submit().then(({ data, loading, error }) => {
											context.setUser(data.registerUser);
											navigate('/');
										});
									}}
								>
									Submit
								</Button>
							</Box>
						</Card>
					</Grid>
					<Grid xs md={6} lg={4} xl={3}>
						<Box p={[1, 2, 3, 4]} marginBottom={4}>
							<Map
								coords={context.coordinates}
								isMarkerShown
								className={styles.map}
								googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&callback=initMap`}
								loadingElement={<div className={styles.mapContainer} />}
								containerElement={<div className={styles.mapContainer} />}
								mapElement={<div className={styles.mapContainer} />}
							/>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};

export default page;
