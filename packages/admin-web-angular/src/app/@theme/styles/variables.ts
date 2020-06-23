// import variablesScss from 'sass-extract-loader!./_variables.scss';

export function styleVariable(name: string) {
	const variablesScss = require('sass-extract-loader!./_variables.scss');
	return variablesScss.global[`$${name}`].value;
}

export namespace styleVariables {
	export const brand = styleVariable('brand').hex;
	export const brandLighted = styleVariable('brand-lighted').hex;
	export const brandDarken = styleVariable('brand-darken').hex;

	export const assertive = styleVariable('assertive').hex;
	export const assertiveLighted = styleVariable('assertive-lighted').hex;
	export const assertiveDarken = styleVariable('assertive-darken').hex;
}
