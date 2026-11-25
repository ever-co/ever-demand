import React from 'react';
import {
	Box,
	FilledInput,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@mui/material';
import countries from '../../assets/countries';
import * as styles from './GeoLogin.module.scss';

/** Address of the sign-up form. `countryId` is the index in `countries` (= Country enum). */
export interface AddressState {
	city: string;
	house: string;
	streetAddress: string;
	apartment: string;
	geoLocation: { countryId: number };
	[field: string]: any;
}

export type ChangeHandler = (
	name: string,
) => (event: { target: { value: any } }) => void;

const fields: [
	label: string,
	name: string,
	type: string,
	fullWidth: boolean,
][] = [
	['City', 'city', 'text', true],
	['House Number', 'house', 'text', true],
	['Street Address', 'streetAddress', 'text', false],
	['Apt. #', 'apartment', 'text', false],
];

const GeoLoginForm = ({
	state,
	handleChange,
}: {
	state: AddressState;
	handleChange: ChangeHandler;
}) => (
	<Box sx={{ width: '100%', p: [1, 2, 3] }}>
		<Grid container spacing={1}>
			<Grid size={12}>
				<FormControl className={styles.control} variant="filled" fullWidth>
					<InputLabel variant={'filled'} htmlFor="countryId">
						Country
					</InputLabel>
					<Select
						input={<FilledInput name="countryId" id="countryId" />}
						value={state.geoLocation.countryId}
						onChange={handleChange('countryId')}
						variant="filled"
					>
						{countries.map((country, i) => (
							<MenuItem value={i} key={country}>
								{country}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
			{fields.map(([label, name, type, fullWidth]) => (
				<Grid size={fullWidth ? 12 : 6} key={name}>
					<TextField
						className={styles.control}
						id={name}
						label={label}
						fullWidth={fullWidth}
						variant="filled"
						slotProps={{ htmlInput: { type } }}
						value={state[name] ?? ''}
						onChange={handleChange(name)}
					/>
				</Grid>
			))}
		</Grid>
	</Box>
);

export default GeoLoginForm;
