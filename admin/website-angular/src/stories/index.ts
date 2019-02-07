import { storiesOf } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { DeviceComponent } from '../app/pages/+device/device.component';

storiesOf('Devices', module)
	.add('with default data', () => ({
		component: DeviceComponent,
		props: {}
	}))
	.add('with default data and action', () => ({
		component: DeviceComponent,
		props: {
			click: action('clicked')
		}
	}));
