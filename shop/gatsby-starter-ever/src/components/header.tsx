import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import Logo from '../assets/ever-logo.svg';

const Header = ({ siteTitle }) => (
	<header
		style={{
			background: `#13b7f3`,
			marginBottom: `1.45rem`,
		}}
	>
		<div>
			<h1 style={{ margin: 0 }} className="title is-4">
				<Link
					to="/"
					style={{
						color: `white`,
						textDecoration: `none`,
					}}
				>
					<img src={Logo} />
				</Link>
			</h1>
		</div>
	</header>
);

Header.propTypes = {
	siteTitle: PropTypes.string,
};

Header.defaultProps = {
	siteTitle: ``,
};

export default Header;
