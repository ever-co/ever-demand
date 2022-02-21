import React from 'react';
import { Provider } from 'react-redux';

// STORE
import { store } from '../../store';

// LOCAL TYPES
export interface Props {
	children: React.ReactElement<any>;
}

const ReduxProvider: React.FC<Props> = (props) => {
	return <Provider store={store}>{props.children}</Provider>;
};

export default ReduxProvider;
