import { DBObject, Index, ModelName, Schema } from '../@pyro/db';
import {
	default as IGeoLocation,
	IGeoLocationCreateObject,
	ILocation,
} from '../interfaces/IGeoLocation';
import * as _ from 'underscore';
import { countries } from '../data/abbreviation-to-country';
import { Column } from 'typeorm';

export const locationPreSchema = {
	type: { type: String },
	coordinates: [Number],
};

/**
 * Stores Geo Location (Address) of some physical entity (Customer, Warehouse, Carrier, etc)
 *
 * @class GeoLocation
 * @extends {DBObject<IGeoLocation, IGeoLocationCreateObject>}
 * @implements {IGeoLocation}
 */
@ModelName('GeoLocation')
class GeoLocation extends DBObject<IGeoLocation, IGeoLocationCreateObject>
	implements IGeoLocation {
	@Schema({ type: Number, required: false })
	@Column()
	countryId: Country | null;

	@Schema({ required: false, type: String })
	@Column()
	postcode?: string | null;

	@Schema({ required: false, type: String })
	@Column()
	notes?: string | null;

	@Schema({ type: String, required: false })
	@Column()
	apartment?: string | null;

	@Schema({ type: String, required: false })
	@Column()
	city: string | null;

	@Schema({ type: String, required: false })
	@Column()
	streetAddress: string | null;

	@Schema({ type: String, required: false })
	@Column()
	house: string | null;

	@Index('2dsphere')
	@Schema(locationPreSchema)
	loc: ILocation;

	get countryName(): CountryName {
		return getCountryName(this.countryId);
	}

	set countryName(countryName: CountryName) {}

	get isLocValid(): any {
		return (
			this.loc.type === 'Point' &&
			typeof _.isArray(this.loc.coordinates) &&
			this.loc.coordinates.length === 2 &&
			_.every(this.loc.coordinates, (c) => _.isFinite(c))
		);
	}

	get isValid(): any {
		const notEmptyString = (s: string) => _.isString(s) && !_.isEmpty(s);
		return _.every(
			[this.city, this.streetAddress, this.house],
			notEmptyString
		);
	}

	get coordinates(): { lng: number; lat: number } {
		// In "MongoDB" geojson standard coordinates list the longitude first and then latitude:
		return {
			lng: this.loc.coordinates[0],
			lat: this.loc.coordinates[1],
		};
	}

	set coordinates(coords: { lng: number; lat: number }) {
		this.loc.coordinates = [coords.lng, coords.lat];
	}
}

export default GeoLocation;

export enum Country {
	// If you wonder what abbreviation must have to use for
	// specific country see "ever\shared\core\data\abbreviation-to-country.json"
	AD,
	AE,
	AF,
	AG,
	AI,
	AL,
	AM,
	AO,
	AQ,
	AR,
	AS,
	AT,
	AU,
	AW,
	AX,
	AZ,
	BA,
	BB,
	BD,
	BE,
	BF,
	BG,
	BH,
	BI,
	BJ,
	BL,
	BM,
	BN,
	BO,
	BQ,
	BR,
	BS,
	BT,
	BV,
	BW,
	BY,
	BZ,
	CA,
	CC,
	CD,
	CF,
	CG,
	CH,
	CI,
	CK,
	CL,
	CM,
	CN,
	CO,
	CR,
	CU,
	CV,
	CW,
	CX,
	CY,
	CZ,
	DE,
	DJ,
	DK,
	DM,
	DO,
	DZ,
	EC,
	EE,
	EG,
	EH,
	ER,
	ES,
	ET,
	FI,
	FJ,
	FK,
	FM,
	FO,
	FR,
	GA,
	GB,
	GD,
	GE,
	GF,
	GG,
	GH,
	GI,
	GL,
	GM,
	GN,
	GP,
	GQ,
	GR,
	GS,
	GT,
	GU,
	GW,
	GY,
	HK,
	HM,
	HN,
	HR,
	HT,
	HU,
	ID,
	IE,
	IL,
	IM,
	IN,
	IO,
	IQ,
	IR,
	IS,
	IT,
	JE,
	JM,
	JO,
	JP,
	KE,
	KG,
	KH,
	KI,
	KM,
	KN,
	KP,
	KR,
	KW,
	KY,
	KZ,
	LA,
	LB,
	LC,
	LI,
	LK,
	LR,
	LS,
	LT,
	LU,
	LV,
	LY,
	MA,
	MC,
	MD,
	ME,
	MF,
	MG,
	MH,
	MK,
	ML,
	MM,
	MN,
	MO,
	MP,
	MQ,
	MR,
	MS,
	MT,
	MU,
	MV,
	MW,
	MX,
	MY,
	MZ,
	NA,
	NC,
	NE,
	NF,
	NG,
	NI,
	NL,
	NO,
	NP,
	NR,
	NU,
	NZ,
	OM,
	PA,
	PE,
	PF,
	PG,
	PH,
	PK,
	PL,
	PM,
	PN,
	PR,
	PS,
	PT,
	PW,
	PY,
	QA,
	RE,
	RO,
	RS,
	RU,
	RW,
	SA,
	SB,
	SC,
	SD,
	SE,
	SG,
	SH,
	SI,
	SJ,
	SK,
	SL,
	SM,
	SN,
	SO,
	SR,
	SS,
	ST,
	SV,
	SX,
	SY,
	SZ,
	TC,
	TD,
	TF,
	TG,
	TH,
	TJ,
	TK,
	TL,
	TM,
	TN,
	TO,
	TR,
	TT,
	TV,
	TW,
	TZ,
	UA,
	UG,
	UM,
	US,
	UY,
	UZ,
	VA,
	VC,
	VE,
	VG,
	VI,
	VN,
	VU,
	WF,
	WS,
	XK,
	YE,
	YT,
	ZA,
	ZM,
	ZW,
}

export type CountryName =
	| 'Andorra'
	| 'United Arab Emirates'
	| 'Afghanistan'
	| 'Antigua and Barbuda'
	| 'Anguilla'
	| 'Albania'
	| 'Armenia'
	| 'Angola'
	| 'Antarctica'
	| 'Argentina'
	| 'American Samoa'
	| 'Austria'
	| 'Australia'
	| 'Aruba'
	| 'Åland'
	| 'Azerbaijan'
	| 'Bosnia and Herzegovina'
	| 'Barbados'
	| 'Bangladesh'
	| 'Belgium'
	| 'Burkina Faso'
	| 'Bulgaria'
	| 'Bahrain'
	| 'Burundi'
	| 'Benin'
	| 'Saint Barthélemy'
	| 'Bermuda'
	| 'Brunei'
	| 'Bolivia'
	| 'Bonaire'
	| 'Brazil'
	| 'Bahamas'
	| 'Bhutan'
	| 'Bouvet Island'
	| 'Botswana'
	| 'Belarus'
	| 'Belize'
	| 'Canada'
	| 'Cocos [Keeling] Islands'
	| 'Democratic Republic of the Congo'
	| 'Central African Republic'
	| 'Republic of the Congo'
	| 'Switzerland'
	| 'Ivory Coast'
	| 'Cook Islands'
	| 'Chile'
	| 'Cameroon'
	| 'China'
	| 'Colombia'
	| 'Costa Rica'
	| 'Cuba'
	| 'Cape Verde'
	| 'Curacao'
	| 'Christmas Island'
	| 'Cyprus'
	| 'Czech Republic'
	| 'Germany'
	| 'Djibouti'
	| 'Denmark'
	| 'Dominica'
	| 'Dominican Republic'
	| 'Algeria'
	| 'Ecuador'
	| 'Estonia'
	| 'Egypt'
	| 'Western Sahara'
	| 'Eritrea'
	| 'Spain'
	| 'Ethiopia'
	| 'Finland'
	| 'Fiji'
	| 'Falkland Islands'
	| 'Micronesia'
	| 'Faroe Islands'
	| 'France'
	| 'Gabon'
	| 'United Kingdom'
	| 'Grenada'
	| 'Georgia'
	| 'French Guiana'
	| 'Guernsey'
	| 'Ghana'
	| 'Gibraltar'
	| 'Greenland'
	| 'Gambia'
	| 'Guinea'
	| 'Guadeloupe'
	| 'Equatorial Guinea'
	| 'Greece'
	| 'South Georgia and the South Sandwich Islands'
	| 'Guatemala'
	| 'Guam'
	| 'Guinea-Bissau'
	| 'Guyana'
	| 'Hong Kong'
	| 'Heard Island and McDonald Islands'
	| 'Honduras'
	| 'Croatia'
	| 'Haiti'
	| 'Hungary'
	| 'Indonesia'
	| 'Ireland'
	| 'Israel'
	| 'Isle of Man'
	| 'India'
	| 'British Indian Ocean Territory'
	| 'Iraq'
	| 'Iran'
	| 'Iceland'
	| 'Italy'
	| 'Jersey'
	| 'Jamaica'
	| 'Jordan'
	| 'Japan'
	| 'Kenya'
	| 'Kyrgyzstan'
	| 'Cambodia'
	| 'Kiribati'
	| 'Comoros'
	| 'Saint Kitts and Nevis'
	| 'North Korea'
	| 'South Korea'
	| 'Kuwait'
	| 'Cayman Islands'
	| 'Kazakhstan'
	| 'Laos'
	| 'Lebanon'
	| 'Saint Lucia'
	| 'Liechtenstein'
	| 'Sri Lanka'
	| 'Liberia'
	| 'Lesotho'
	| 'Lithuania'
	| 'Luxembourg'
	| 'Latvia'
	| 'Libya'
	| 'Morocco'
	| 'Monaco'
	| 'Moldova'
	| 'Montenegro'
	| 'Saint Martin'
	| 'Madagascar'
	| 'Marshall Islands'
	| 'Macedonia'
	| 'Mali'
	| 'Myanmar [Burma]'
	| 'Mongolia'
	| 'Macao'
	| 'Northern Mariana Islands'
	| 'Martinique'
	| 'Mauritania'
	| 'Montserrat'
	| 'Malta'
	| 'Mauritius'
	| 'Maldives'
	| 'Malawi'
	| 'Mexico'
	| 'Malaysia'
	| 'Mozambique'
	| 'Namibia'
	| 'New Caledonia'
	| 'Niger'
	| 'Norfolk Island'
	| 'Nigeria'
	| 'Nicaragua'
	| 'Netherlands'
	| 'Norway'
	| 'Nepal'
	| 'Nauru'
	| 'Niue'
	| 'New Zealand'
	| 'Oman'
	| 'Panama'
	| 'Peru'
	| 'French Polynesia'
	| 'Papua New Guinea'
	| 'Philippines'
	| 'Pakistan'
	| 'Poland'
	| 'Saint Pierre and Miquelon'
	| 'Pitcairn Islands'
	| 'Puerto Rico'
	| 'Palestine'
	| 'Portugal'
	| 'Palau'
	| 'Paraguay'
	| 'Qatar'
	| 'Réunion'
	| 'Romania'
	| 'Serbia'
	| 'Russia'
	| 'Rwanda'
	| 'Saudi Arabia'
	| 'Solomon Islands'
	| 'Seychelles'
	| 'Sudan'
	| 'Sweden'
	| 'Singapore'
	| 'Saint Helena'
	| 'Slovenia'
	| 'Svalbard and Jan Mayen'
	| 'Slovakia'
	| 'Sierra Leone'
	| 'San Marino'
	| 'Senegal'
	| 'Somalia'
	| 'Suriname'
	| 'South Sudan'
	| 'São Tomé and Príncipe'
	| 'El Salvador'
	| 'Sint Maarten'
	| 'Syria'
	| 'Swaziland'
	| 'Turks and Caicos Islands'
	| 'Chad'
	| 'French Southern Territories'
	| 'Togo'
	| 'Thailand'
	| 'Tajikistan'
	| 'Tokelau'
	| 'East Timor'
	| 'Turkmenistan'
	| 'Tunisia'
	| 'Tonga'
	| 'Turkey'
	| 'Trinidad and Tobago'
	| 'Tuvalu'
	| 'Taiwan'
	| 'Tanzania'
	| 'Ukraine'
	| 'Uganda'
	| 'U.S. Minor Outlying Islands'
	| 'United States'
	| 'Uruguay'
	| 'Uzbekistan'
	| 'Vatican City'
	| 'Saint Vincent and the Grenadines'
	| 'Venezuela'
	| 'British Virgin Islands'
	| 'U.S. Virgin Islands'
	| 'Vietnam'
	| 'Vanuatu'
	| 'Wallis and Futuna'
	| 'Samoa'
	| 'Kosovo'
	| 'Yemen'
	| 'Mayotte'
	| 'South Africa'
	| 'Zambia'
	| 'Zimbabwe'
	| null;

export function getCountryName(country: null): null;
export function getCountryName(country: Country): CountryName;
export function getCountryName(country: Country | null): CountryName | null;
export function getCountryName(country: Country | null): CountryName | null {
	return countries[Country[country]] || null;
}

export const countriesIdsToNamesArray: {
	id: Country;
	name: CountryName;
}[] = Object.keys(countries)
	.map((abbr) => {
		return { id: Country[abbr], name: getCountryName(+Country[abbr]) };
	})
	.sort((c1, c2) => c1.name.localeCompare(c2.name));
