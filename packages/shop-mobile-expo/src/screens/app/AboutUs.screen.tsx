import * as React from 'react';
import { Text, View, ScrollView, StyleSheet, Linking } from 'react-native';
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';
import FocusAwareStatusBar from '../../components/Common/FocusAwareStatusBar';
import CustomScreenHeader from '../../components/Common/CustomScreenHeader';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

const AboutUsScreen = () => {
	// STYLES
	const STYLES = StyleSheet.create({
		container: {
			...GS.screen,
		},
		scrollView: {
			...GS.h100,
			...GS.pt4,
			...GS.px2,
		},
		titleText: {
			fontSize: CS.FONT_SIZE_MD,
			fontWeight: 'bold',
			color: '#AAAAAA',
		},
		headerTitle: {
			...GS.fontBold,
			fontSize: CS.FONT_SIZE_MD + 2,
		},
		text: {
			color: '#6A6A66',
		},
	});

	const LinkToSocial = (link: string) => {
		Linking.openURL(link).catch((err) =>
			console.error('An error occurred', err),
		);
	};

	return (
		<View style={STYLES.container}>
			<FocusAwareStatusBar />
			<CustomScreenHeader>
				<View style={[GS.w100, GS.alignCenter]}>
					<Text style={STYLES.headerTitle}>About Us</Text>
				</View>
			</CustomScreenHeader>
			<ScrollView style={STYLES.scrollView}>
				<View>
					<Text style={STYLES.titleText}>
						Do you think online shopping could be better ?
					</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						So, you never wait half an hour for order to be prepared
						or cooked. And it never again comes broken or cold. How
						about the phrase `out of stock`, it's annoying right ?
					</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						In our app, this will never happen, ever! Here is why...
					</Text>
				</View>
				<View style={GS.mt3}>
					<Text style={STYLES.titleText}>INSTANT</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						All already prepared hot.
					</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						Get it delivered from your tap to your door in 5-10
						minutes.
					</Text>
				</View>
				<View style={GS.mt3}>
					<Text style={STYLES.titleText}>SIMPLE</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						Just swipe for something you like, tap `Buy`and your
						order is on its way. You can pay during or after
						delivery !
					</Text>
				</View>

				<View style={GS.mt3}>
					<Text style={STYLES.titleText}>SAFE & LOVE</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						We deliver from local stores and restaurants you already
						know and love. Only good surprises here!
					</Text>
				</View>
				<View style={[GS.row, GS.justifyAround, GS.mt5]}>
					<FontAwesome.Button
						name='facebook'
						color={CC.gray}
						backgroundColor={CC.primary}
						size={CS.FONT_SIZE * 4}
						onPress={() =>
							LinkToSocial('https://web.facebook.com/evercoapp')
						}
					/>

					<AntDesign.Button
						name='twitter'
						color={CC.gray}
						backgroundColor={CC.primary}
						size={CS.FONT_SIZE * 4}
						onPress={() =>
							LinkToSocial('https://twitter.com/evercoapp')
						}
					/>

					<AntDesign.Button
						name='googleplus'
						color={CC.gray}
						backgroundColor={CC.primary}
						size={CS.FONT_SIZE * 4}
						onPress={() =>
							LinkToSocial(
								'https://plus.google.com/b/113148716026744340472',
							)
						}
					/>
					<AntDesign.Button
						name='instagram'
						color={CC.gray}
						backgroundColor={CC.primary}
						size={CS.FONT_SIZE * 4}
						onPress={() =>
							LinkToSocial('https://www.instagram.com/evercoapp/')
						}
					/>
				</View>
				<View>
					<Text style={[GS.mt1, STYLES.text]}>
						Copyright © 2016-present, Ever Co. LTD. All Rights
						Reserved.
					</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						EVER® is a registered trademark of Ever Co. LTD.
					</Text>
					<Text style={[GS.mt1, STYLES.text]}>
						All other trademarks © to respective owners. We are in α
						(alpha). Please be nice!
					</Text>
				</View>
			</ScrollView>
		</View>
	);
};

export default AboutUsScreen;
