import React from 'react';
import PropTypes from 'prop-types';
import styles from './GeoLogin.module.scss'

const GeoLogin = ({title, subtitle, logo}) => {
  return (
    <div className={styles.content + styles.auth}>
    <div className={styles.formContent}>
      <div className={styles.logo}><img src={logo} /></div>
        <h2 className={styles.title}>
          {title}
        </h2>
        <h2 className={styles.slogan + styles.locationSlogan}>{subtitle}</h2>
      </div>
    </div>
  )};

GeoLogin.propTypes = {
  // bla: PropTypes.string,
};

GeoLogin.defaultProps = {
  // bla: 'test',
};

export default GeoLogin;
