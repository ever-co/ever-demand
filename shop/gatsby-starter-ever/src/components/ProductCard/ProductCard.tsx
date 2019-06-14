import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, CardActions, Button } from '@material-ui/core';
import { navigate } from 'gatsby';
//import { Test } from './ProductCard.styles';

const ProductCard = ({item, addToCart}) => {
  const { product } = item.warehouseProduct;
  return (
    <Card style={{
      background: `rgba(66, 66, 66)`,
      height: '450px',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      padding: '.2em'
    }}>
      <img src={product.images[0].url} style={{
        // height: "100%",
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }} />
      <CardContent>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          background: 'rgba(66, 66, 66, 0.5)',
          width: '100%',
          padding: '8px',
          color: 'white'

        }}>
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
