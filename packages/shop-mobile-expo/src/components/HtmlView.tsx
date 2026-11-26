import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const WRAP = (html: string) =>
	`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" />` +
	`<style>body{background:transparent;color:#f4f5f8;font-family:-apple-system,Roboto,sans-serif;padding:12px}` +
	`a{color:#bd4742}img{max-width:100%}</style></head><body>${html}</body></html>`;

/** Server HTML (info pages, the feed placeholder). The web build has its own version. */
export function HtmlView({ html, testID = 'html-view' }: { html: string; testID?: string }) {
	return (
		<View style={styles.container} testID={testID}>
			<WebView
				originWhitelist={['*']}
				source={{ html: WRAP(html) }}
				style={styles.webview}
				javaScriptEnabled={false}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, minHeight: 200 },
	webview: { flex: 1, backgroundColor: 'transparent' },
});
