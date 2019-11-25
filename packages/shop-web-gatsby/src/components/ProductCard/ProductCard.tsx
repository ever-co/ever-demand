import React from 'react';
import {
	Button,
	Card,
	CardActions,
	CardContent,
	Typography,
} from '@material-ui/core';
import { navigate } from 'gatsby';
import styles from './ProductCard.module.scss';
import { matchLocale } from '../../utilities/utilities';
//import { Test } from './ProductCard.styles';

const ProductCard = ({ item, addToCart }) => {
	const { product } = item.warehouseProduct;
	return (
		<Card className={styles.card}>
			<img src={product.images[0].url} />
			<CardContent>
				<div className={styles.cardContent}>
					<Typography variant={'h5'}>{matchLocale(product.title)}</Typography>
					<Typography variant={'body1'}>
						{matchLocale(product.description)}
					</Typography>
					<CardActions>
						<Button
							variant={'contained'}
							color={'secondary'}
							onClick={() => {
								addToCart(item);
							}}
						>
							Buy for: ${item.warehouseProduct.price.toFixed(2)}
						</Button>
						<Button
							variant={'contained'}
							onClick={() => navigate(`/${product.id}`)}
						>
							Details
						</Button>
					</CardActions>
				</div>
			</CardContent>
		</Card>
	);
};

ProductCard.propTypes = {
	// bla: PropTypes.string,
};

ProductCard.defaultProps = {
	// bla: 'test',
};

export default ProductCard;
