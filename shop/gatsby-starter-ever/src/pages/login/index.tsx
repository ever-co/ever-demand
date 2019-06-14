import React, { useContext, useState } from 'react';
import Header from './Header';
import logo from '../../assets/ever-logo.svg';
import styles from '../../styles/styles.module.scss';
import {Box, Button, Card, Grid} from '@material-ui/core';
import GeoLoginForm from '../../components/GeoLoginForm';
import Map from '../../components/Map'
import { AppContext } from '../../Context';
import config from '../../config'
import { useMutation } from 'react-apollo-hooks';
import { CreateUser } from '../../apollo/user';
import {navigate} from "@reach/router";

const defaultUser = {
	email: "",
	firstName: "",
	lastName: "",
	phone: "",
	apartment: "",
	geoLocation: {
		loc: {
			type: "Point",
			coordinates: null
		},
		countryId: 0,
		streetAddress: "",
		house: "",
		postcode: "",
		city: ""
	},
}

const page = () => {
	const context = useContext(AppContext)
	const [state, setState] = useState({...defaultUser})
	const handleChange = (name: string) => (event: { target: { value: any; }; }) => {
		if (name === 'countryId'){
			let newState = {...state}
			newState.geoLocation.countryId = event.target.value
			setState(newState)
		}
		else {
			setState({ ...state, [name]: event.target.value });
		}

	};
	const formatUser = () => {
		let user = { ...state };
		user.geoLocation.loc.coordinates = context.coordinates;
		return (user);
	};
	const submit = useMutation(CreateUser, {
		variables: { user: formatUser(), password: '' }
	});
	return (
		<Box className={styles.auth}>
			<Box width={1} textAlign={'center'} p={2} py={6}>
				<Header title={'ever'} subtitle={'some subtitle here'} logo={logo} />
			</Box>

			<Grid container justify={'center'} spacing={6} alignContent={'stretch'}>
				<Grid item xs md={6} xl={4}>
					<Card className={styles.card}>
					<GeoLoginForm state={state} handleChange={handleChange} />

						<Box marginTop={4}>
							<Button variant={'contained'} onClick={() => {
								submit().then(
									({data, loading, error}) => {
										context.setUser(data.registerUser)
										navigate('/')
									}
								)
							}
							}>Submit</Button>
						</Box>
					</Card>
				</Grid>
				<Grid  xs md={6} xl={4}>
					<Map
						coords={context.coordinates}
						isMarkerShown
						className={styles.map}
						googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&callback=initMap`}
						loadingElement={<div className={styles.mapContainer} />}
						containerElement={<div className={styles.mapContainer} />}
						mapElement={<div className={styles.mapContainer} />}  />
				</Grid>
			</Grid>
		</Box>


);
};

export default page;
