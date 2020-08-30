import {
	Box,
	FilledInput,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import countries from '../../assets/countries';
import Map from '../Map';
import styles from './GeoLogin.module.scss';

const fields = [
	['City', 'city', 'text', true],
	['House Number', 'house', 'text', true],
	['Street Address', 'streetAddress', 'text', false],
	['Apt. #', 'apartment', 'text', false],
];
const GeoLoginForm = ({ state, handleChange }) => {
	console.log(styles);
	return (
		<Box style={{ width: '100%' }} p={[1, 2, 3]}>
			<Grid container spacing={1}>
				<Grid item xs={12}>
					<FormControl className={styles.control} variant="filled" fullWidth>
						<InputLabel variant={'filled'} htmlFor="countryId">
							Country
						</InputLabel>
						<Select
							input={<FilledInput name="Country" id="countryId" />}
							value={state.geoLocation.countryId}
							onChange={handleChange('countryId')}
							inputProps={{
								name: 'countryId',
								id: 'countryId',
							}}
							variant="filled"
						>
							{countries.map((country, i) => (
								<MenuItem value={i} key={i}>
									{' '}
									{country}{' '}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				{fields.map((field) => (
					<Grid item xs={field[3] ? 12 : 6} mt={1}>
						<TextField
							className={styles.control}
							id={field[1]}
							label={field[0]}
							fullWidth={field[3]}
							variant="filled"
							inputProps={{
								type: field[2],
							}}
							value={state[field[1]]}
							onChange={handleChange(field[1])}
						/>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

GeoLoginForm.propTypes = {
	// bla: PropTypes.string,
};

GeoLoginForm.defaultProps = {
	// bla: 'test',
};

export default GeoLoginForm;
