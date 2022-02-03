import React from "react";
import { View, ActivityIndicator, FlatList } from "react-native";
import { gql, useQuery } from "@apollo/client";

// SELECTORS
import { useAppSelector } from "../store/hooks";
import { getLanguage } from "../store/features/translation";

// COMPONENTS
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";
import PaperText from "../components/PaperText";
import CustomScreenHeader from "../components/CustomScreenHeader";

// STYLES
import { GLOBAL_STYLE as GS } from "../assets/ts/styles";

// QUERY
const CHAPTERS_QUERY = gql`
	query Chapters {
		chapters {
			id
			number
			title
		}
	}
`;

function HomeScreen({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	//
	const { data, loading } = useQuery(CHAPTERS_QUERY);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>
			<CustomScreenHeader title={LANGUAGE.PRODUCTS_VIEW.TITLE} showControls />

			{loading ? (
				<View style={{ ...GS.centered, ...GS.w100, flex: 1 }}>
					<ActivityIndicator color={"#FFF"} size={25} />
				</View>
			) : (
				<FlatList
					data={data.chapters}
					renderItem={({ item }) => {
						return (
							<PaperText
								style={{
									...GS.px2,
									...GS.py3,
									...GS.mb2,
									...GS.shadow,
								}}
							>
								{item?.title || item?.header || item?.subheader}
							</PaperText>
						);
					}}
					keyExtractor={(item) => item.id.toString()}
					style={{ ...GS.h100, ...GS.pt3 }}
				/>
			)}
		</View>
	);
}

export default HomeScreen;
