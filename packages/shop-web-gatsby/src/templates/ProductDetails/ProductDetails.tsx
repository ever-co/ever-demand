import { Box, Button, Container, Grid, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import Layout from '../../components/layout';
import { Card, Carousel } from './styles';

// @ts-ignore
const ProductTemplate = ({ data }) => {
	const { product } = data.ever;
	const [activeImage, setActiveImage] = useState(product.images[0].url);
	return (
		<Layout>
			<Card>
				<Grid container justify={'center'}>
					<Grid
						item
						container
						xs={12}
						lg={6}
						style={{ position: 'relative' }}
						justify={'center'}
					>
						<Container>
							<img
								style={{
									height: '450px',
									margin: '0 auto',
									display: 'block',
									maxWidth: '100%',
								}}
								src={activeImage}
							/>
							<Box width={1} height={'180px'} p={2}>
								<Carousel wrapAround slidesToShow={4}>
									{product.images.map((image: { url: string | undefined }) => (
										<img
											src={image.url}
											onClick={() => setActiveImage(image.url)}
										/>
									))}
								</Carousel>
							</Box>
						</Container>
					</Grid>

					<Grid item xs={12} lg={6}>
						<Typography variant={'h5'}> {product.title[0].value} </Typography>
						<br />
						<Typography variant={'body1'}>
							{' '}
							{product.description[0].value}{' '}
						</Typography>
						<Button variant={'contained'} color={'secondary'}>
							{' '}
							Order{' '}
						</Button>
						<Typography variant={'body2'} color={'secondary'}>
							{' '}
							{product.details[0].value}{' '}
						</Typography>
					</Grid>
				</Grid>
			</Card>
		</Layout>
	);
};
export default ProductTemplate;
