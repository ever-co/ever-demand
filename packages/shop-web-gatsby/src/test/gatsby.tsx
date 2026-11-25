/** Test double of the `gatsby` module (aliased in vitest.config.ts). */
import React, { type ReactNode } from 'react';
import { vi } from 'vitest';

export const navigate = vi.fn();

export const Link = ({
	to,
	children,
	...props
}: {
	to: string;
	children?: ReactNode;
	[prop: string]: unknown;
}) => (
	<a href={to} {...props}>
		{children}
	</a>
);

export const graphql = () => {
	throw new Error('Gatsby GraphQL is not used by the shop');
};

export type PageProps = { params: Record<string, string>; [prop: string]: any };
