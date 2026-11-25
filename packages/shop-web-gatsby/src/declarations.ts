// Types of the non-code imports that Gatsby's webpack config handles.
// (A .ts file, not a .d.ts: the package .gitignore ignores **/*.d.ts as build output.)

declare module '*.module.scss' {
	const classes: { readonly [className: string]: string };
	export = classes;
}

declare module '*.scss';

declare module '*.svg' {
	const url: string;
	export default url;
}

declare module '*.png' {
	const url: string;
	export default url;
}
