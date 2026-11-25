import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Server HTML in the web build. The HTML comes from our own API (about, help, privacy, terms,
 * placeholder), which the Ionic app also rendered as trusted HTML.
 */
export function HtmlView({ html, testID = 'html-view' }: { html: string; testID?: string }) {
	return (
		<View style={styles.container} testID={testID}>
			{React.createElement('div', {
				style: { color: '#f4f5f8', padding: 12, fontFamily: 'sans-serif' },
				dangerouslySetInnerHTML: { __html: html },
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
