module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// Long dependency lists and migration notes are fine in bodies.
		'body-max-line-length': [0],
		'footer-max-line-length': [0],
	},
};
