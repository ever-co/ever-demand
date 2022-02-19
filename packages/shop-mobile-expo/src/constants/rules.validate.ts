// This file contain rule validation constants for validate.js

/**
 * Require a non-empty field
 */
export const REQUIRE_PRESENCE = {
	allowEmpty: false,
};

// TODO: Add some useful comments
export const TEL_FORMAT = {
	pattern: /^[0-9]?()[0-9](\s|\S)(\d[0-9]{9})$/,
};

export const NUMERIC_FORMAT = {
	pattern: /^[0-9]+$/,
};

export const REQUIRE_EMAIL = {
	...REQUIRE_PRESENCE,
};

export const REQUIRE_NUMERIC = {
	...NUMERIC_FORMAT,
	strict: true,
};

export const REQUIRE_NUMERIC_NOT_STRICK = {
	...NUMERIC_FORMAT,
	strict: false,
};
