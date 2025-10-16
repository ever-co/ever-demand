import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import ENV from './src/environments/environment';

// APP COMPONENT
import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
if (ENV.PRODUCTION || !__DEV__) {
	LogBox.ignoreAllLogs();
}
