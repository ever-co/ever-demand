import React from 'react';
import styled from 'styled-components';
import { Card as CardBase } from '@material-ui/core';

import CarouselBase from 'nuka-carousel';

export const Card = styled(CardBase)`
	padding: 16px;
`;

export const Carousel = styled(CarouselBase)`
	height: 180px;
	.silder-frame {
		height: 180px;
	}
	.slider-slide > img {
		max-height: 160px;
		margin: 0;
		width: auto;
	}
`;
