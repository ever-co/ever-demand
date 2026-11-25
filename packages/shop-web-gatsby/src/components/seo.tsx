/**
 * Head tags of a page, for Gatsby's Head API (it replaced react-helmet):
 *
 *   export const Head = () => <Seo title="Orders" />;
 */
import React from 'react';
import { siteMetadata } from '../site';

interface SeoProps {
	title: string;
	description?: string;
	lang?: string;
	keywords?: string[];
}

function Seo({ title, description, lang = 'en', keywords = [] }: SeoProps) {
	const metaDescription = description || siteMetadata.description;
	const fullTitle = `${title} | ${siteMetadata.title}`;

	return (
		<>
			<html lang={lang} />
			<title>{fullTitle}</title>
			<meta name="description" content={metaDescription} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={metaDescription} />
			<meta property="og:type" content="website" />
			<meta name="twitter:card" content="summary" />
			<meta name="twitter:creator" content={siteMetadata.author} />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={metaDescription} />
			{keywords.length > 0 && (
				<meta name="keywords" content={keywords.join(', ')} />
			)}
		</>
	);
}

export default Seo;
