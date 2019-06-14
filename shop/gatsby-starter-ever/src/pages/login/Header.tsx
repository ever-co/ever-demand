import React from 'react';
import PropTypes from 'prop-types';
import styles from './GeoLogin.module.scss'
// import Map from '../Map'

const Header = ({title, subtitle, logo}) => {
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

Header.propTypes = {
  // bla: PropTypes.string,
};

Header.defaultProps = {
  // bla: 'test',
};

export default Header;
