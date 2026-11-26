import styled from 'styled-components';
import { Card as CardBase } from '@mui/material';
import { Carousel as CarouselBase } from 'nuka-carousel';

export const Card = styled(CardBase)`
	padding: 16px;
`;

/** Thumbnails: four per view, like the old nuka-carousel `slidesToShow={4}`. */
export const Carousel = styled(CarouselBase)`
	height: 180px;

	img {
		flex: 0 0 25%;
		max-height: 160px;
		margin: 0;
		width: auto;
		cursor: pointer;
	}
`;
