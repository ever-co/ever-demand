import React from 'react';
import {
	Button,
	Card,
	CardActions,
	CardContent,
	Typography,
} from '@mui/material';
import { navigate } from 'gatsby';
import * as styles from './ProductCard.module.scss';
import { matchLocale } from '../../utilities/locale';
import type { GeoLocationProductsByPagingQuery } from '../../gql/graphql';

export type ProductInfo =
	GeoLocationProductsByPagingQuery['geoLocationProductsByPaging'][number];

interface ProductCardProps {
	item: ProductInfo;
	addToCart: (item: ProductInfo) => void;
}

/** One product of the grid: image, title, description, "buy" and "details". */
const ProductCard = ({ item, addToCart }: ProductCardProps) => {
	const { product } = item.warehouseProduct;
	const image = product.images[0];
	const title = matchLocale(product.title);

	return (
		<Card className={styles.card}>
			{image && <img src={image.url} alt={title} loading="lazy" />}
			<CardContent>
				<div className={styles.cardContent}>
					<Typography variant={'h5'}>{title}</Typography>
					<Typography variant={'body1'}>
						{matchLocale(product.description)}
					</Typography>
					<CardActions>
						<Button
							variant={'contained'}
							color={'secondary'}
							onClick={() => addToCart(item)}
						>
							Buy for: ${item.warehouseProduct.price.toFixed(2)}
						</Button>
						<Button
							variant={'contained'}
							onClick={() => navigate(`/products/${product.id}`)}
						>
							Details
						</Button>
					</CardActions>
				</div>
			</CardContent>
		</Card>
	);
};

export default ProductCard;
