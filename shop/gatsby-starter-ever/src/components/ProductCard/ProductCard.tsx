import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, CardActions, Button } from '@material-ui/core';
import { navigate } from 'gatsby';
import styles from './ProductCard.module.scss'
//import { Test } from './ProductCard.styles';

const ProductCard = ({item, addToCart}) => {
  const { product } = item.warehouseProduct;
  return (
    <Card className={styles.card}>
      <img src={product.images[0].url} />
      <CardContent>
        <div className={styles.cardContent}>
          <Typography variant={'h5'}>
            {product.title[0].value}
          </Typography>
          <Typography variant={'body1'}>
            {product.description[0].value}
          </Typography>
          <CardActions>
            <Button variant={'contained'}
                color={'secondary'}
                onClick={() => {
                  addToCart(item)
                  navigate('/Orders')
                }
                }
            >
              Buy for: ${item.warehouseProduct.price.toFixed(2)}
            </Button>
            <Button variant={'contained'} onClick={() => navigate(`/${product.id}`)}>Details</Button>
          </CardActions>
        </div>
      </CardContent>
    </Card>
)};

ProductCard.propTypes = {
  // bla: PropTypes.string,
};

ProductCard.defaultProps = {
  // bla: 'test',
};

export default ProductCard;
