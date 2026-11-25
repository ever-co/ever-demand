import React, { useState } from 'react';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { matchLocale } from '../../utilities/locale';
import { Card, Carousel } from './styles';
import type { ProductQuery } from '../../gql/graphql';

export type ShopProduct = NonNullable<ProductQuery['product']>;

/** A product: the active image, the thumbnails carousel, title, description and details. */
const ProductDetails = ({ product }: { product: ShopProduct }) => {
	const [activeImage, setActiveImage] = useState(product.images[0]?.url);
	const title = matchLocale(product.title);

	return (
		<Card>
			<Grid sx={{ justifyContent: 'center' }} container>
				<Grid
					container
					size={{ xs: 12, lg: 6 }}
					sx={{ justifyContent: 'center', position: 'relative' }}
				>
					<Container>
						{activeImage && (
							<img
								style={{
									height: '450px',
									margin: '0 auto',
									display: 'block',
									maxWidth: '100%',
								}}
								src={activeImage}
								alt={title}
							/>
						)}
						<Box sx={{ width: 1, height: '180px', p: 2 }}>
							<Carousel showArrows wrapMode="wrap" scrollDistance="slide">
								{product.images.map((image, i) => (
									<img
										key={`${image.url}-${i}`}
										src={image.url}
										alt={`${title} ${i + 1}`}
										onClick={() => setActiveImage(image.url)}
									/>
								))}
							</Carousel>
						</Box>
					</Container>
				</Grid>

				<Grid size={{ xs: 12, lg: 6 }}>
					<Typography variant={'h5'}>{title}</Typography>
					<br />
					<Typography variant={'body1'}>
						{matchLocale(product.description)}
					</Typography>
					<Button variant={'contained'} color={'secondary'}>
						Order
					</Button>
					<Typography variant={'body2'} color={'secondary'}>
						{matchLocale(product.details)}
					</Typography>
				</Grid>
			</Grid>
		</Card>
	);
};

export default ProductDetails;
