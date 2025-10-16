// This file contain rule validation constants for validate.js

// import { validate } from 'validate.js';

// TODO: Type constants

/**
 * Require a non-empty field
 */
export const NOT_ALLOW_EMPTY_PRESENCE = {
	allowEmpty: false,
};

// TODO: Add some useful comments
export const TEL_FORMAT = {
	pattern: /^[0-9]?()[0-9](\s|\S)(\d[0-9]{9})$/,
};

export const NUMERIC_FORMAT = {
	pattern: /^[0-9]+$/,
};

export const REQUIRE_NOT_EMPTY_PRESENCE = {
	presence: NOT_ALLOW_EMPTY_PRESENCE,
};

export const REQUIRE_EMAIL = {
	...REQUIRE_NOT_EMPTY_PRESENCE,
	email: true,
};

export const REQUIRE_NUMERIC = {
	format: {
		...NUMERIC_FORMAT,
	},
	strict: true,
};

export const REQUIRE_NUMERIC_NOT_STRICK = {
	format: {
		...NUMERIC_FORMAT,
	},
	strict: false,
};
