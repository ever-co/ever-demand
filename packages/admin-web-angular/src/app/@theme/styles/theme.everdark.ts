export const EVERDARK_THEME = {
	name: 'everdark',
	base: 'default',
	variables: {
		temperature: ['#2ec7fe', '#31ffad', '#7bff24', '#fff024', '#f7bd59'],

		solar: {
			gradientLeft: '#7bff24',
			gradientRight: '#2ec7fe',
			shadowColor: '#19977E',
			radius: ['70%', '90%'],
		},

		traffic: {
			colorBlack: '#000000',
			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipBorderColor: '#00d977',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 4px 16px;',
			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',

			lineBg: '#d1d1ff',
			lineShadowBlur: '14',
			itemColor: '#BEBBFF',
			itemBorderColor: '#ffffff',
			itemEmphasisBorderColor: '#ffffff',
			shadowLineDarkBg: '#655ABD',
			shadowLineShadow: 'rgba(33, 7, 77, 0.5)',
			gradFrom: 'rgba(118, 89, 255, 0.4)',
			gradTo: 'rgba(164, 84, 255, 0.5)',
		},

		electricity: {
			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipLineColor: 'rgba(255, 255, 255, 0.1)',
			tooltipLineWidth: '1',
			tooltipBorderColor: '#00d977',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 8px 24px;',
			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',

			axisLineColor: 'rgba(161, 161 ,229, 0.3)',
			xAxisTextColor: '#a1a1e5',
			yAxisSplitLine: 'rgba(161, 161 ,229, 0.2)',

			itemBorderColor: '#ffffff',
			lineStyle: 'dotted',
			lineWidth: '6',
			lineGradFrom: '#00ffaa',
			lineGradTo: '#fff835',
			lineShadow: 'rgba(14, 16, 48, 0.4)',

			areaGradFrom: 'rgba(188, 92, 255, 0.5)',
			areaGradTo: 'rgba(188, 92, 255, 0)',
			shadowLineDarkBg: '#a695ff',
		},

		bubbleMap: {
			titleColor: '#ffffff',
			areaColor: '#2c2961',
			areaHoverColor: '#a1a1e5',
			areaBorderColor: '#654ddb',
		},

		profitBarAnimationEchart: {
			textColor: '#ffffff',

			firstAnimationBarColor: '#0088ff',
			secondAnimationBarColor: '#7659ff',

			splitLineStyleOpacity: '0.06',
			splitLineStyleWidth: '1',
			splitLineStyleColor: '#000000',

			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',
			tooltipFontSize: '16',
			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipBorderColor: '#00d977',
			tooltipBorderWidth: '3',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 4px 16px;',
		},

		trafficBarEchart: {
			gradientFrom: '#fc0',
			gradientTo: '#ffa100',
			shadow: '#ffb600',
			shadowBlur: '5',

			axisTextColor: 'white',
			axisFontSize: '12',

			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipBorderColor: '#00d977',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 4px 16px;',
			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',
		},

		countryOrders: {
			countryBorderColor: '#525dbd',
			countryFillColor: '#4f41a6',
			countryBorderWidth: '2',
			hoveredCountryBorderColor: '#00f9a6',
			hoveredCountryFillColor: '#377aa7',
			hoveredCountryBorderWidth: '3',

			chartAxisLineColor: 'rgba(161, 161 ,229, 0.3)',
			chartAxisTextColor: '#a1a1e5',
			chartAxisFontSize: '16',
			chartGradientTo: '#00c7c7',
			chartGradientFrom: '#00d977',
			chartAxisSplitLine: 'rgba(161, 161 ,229, 0.2)',
			chartShadowBarColor: '#2f296b',

			chartLineBottomShadowColor: '#00977e',

			chartInnerLineColor: '#2f296b',
		},

		echarts: {
			bg: '#3d3780',
			textColor: '#ffffff',
			axisLineColor: 'white',
			splitLineColor: 'white',
			itemHoverShadowColor: 'rgba(0, 0, 0, 0.5)',
			tooltipBackgroundColor: '#6a7985',
			areaOpacity: '1',
		},

		chartjs: {
			axisLineColor: '#a1a1e5',
			textColor: '#ffffff',
		},

		orders: {
			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipLineColor: 'rgba(255, 255, 255, 0.1)',
			tooltipLineWidth: '1',
			tooltipBorderColor: '#00d977',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 8px 24px;',
			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',
			tooltipFontSize: '20',

			axisLineColor: 'rgba(161, 161 ,229, 0.3)',
			axisFontSize: '16',
			axisTextColor: 'white',
			yAxisSplitLine: 'rgba(161, 161 ,229, 0.2)',

			itemBorderColor: '#ffffff',
			lineStyle: 'solid',
			lineWidth: '4',

			// first line
			firstAreaGradFrom: 'transparent',
			firstAreaGradTo: 'transparent',
			firstShadowLineDarkBg: '#018dff',

			// second line
			secondLineGradFrom: 'orange',
			secondLineGradTo: 'red',

			secondAreaGradFrom: '#ce4843',
			secondAreaGradTo: 'orange',
			secondShadowLineDarkBg: '#2c5a85',

			// third line
			thirdLineGradFrom: '#47d26f',
			thirdLineGradTo: 'springgreen',

			thirdAreaGradFrom: 'rgba(131 ,126, 124, 0.7)',
			thirdAreaGradTo: 'rgba(230, 226, 230, 0.5)',
			thirdShadowLineDarkBg: '#a695ff',
		},

		profit: {
			bg: 'transparent',
			textColor: '#ffffff',
			axisLineColor: '#fff',
			splitLineColor: '#fff',
			areaOpacity: '1',

			axisFontSize: '16',
			axisTextColor: '#fff',

			// first bar
			firstLineGradFrom: '#555',
			firstLineGradTo: '#888',
			firstLineShadow: 'rgba(14, 16, 48, 0.4)',

			// second bar
			secondLineGradFrom: '#8069ff',
			secondLineGradTo: '#8357ff',
			secondLineShadow: 'rgba(14, 16, 48, 0.4)',

			// third bar
			thirdLineGradFrom: '#4e40a4',
			thirdLineGradTo: '#4e40a4',
			thirdLineShadow: 'rgba(14, 16, 48, 0.4)',
		},

		orderProfitLegend: {
			firstItem:
				'linear-gradient(90deg, #47d26f 0%, mediumspringgreen 100%)',
			secondItem: 'linear-gradient(90deg, #ce4843 0%, orange 100%)',
			thirdItem: 'linear-gradient(90deg, gray 0%, lightgray 100%)',
		},

		visitors: {
			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipLineColor: 'rgba(255, 255, 255, 0.1)',
			tooltipLineWidth: '1',
			tooltipBorderColor: '#00d977',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 8px 24px;',
			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',

			axisLineColor: 'rgba(161, 161 ,229, 0.3)',
			axisFontSize: '16',
			axisTextColor: '#a1a1e5',
			yAxisSplitLine: 'rgba(161, 161 ,229, 0.2)',

			itemBorderColor: '#ffffff',
			lineStyle: 'dotted',
			lineWidth: '6',
			lineGradFrom: '#ffffff',
			lineGradTo: '#ffffff',
			lineShadow: 'rgba(14, 16, 48, 0.4)',

			areaGradFrom: 'rgba(188, 92, 255, 1)',
			areaGradTo: 'rgba(188, 92, 255, 0.5)',
			shadowLineDarkBg: '#a695ff',

			innerLineStyle: 'solid',
			innerLineWidth: '1',

			innerAreaGradFrom: 'rgba(59, 165, 243, 1)',
			innerAreaGradTo: 'rgba(4, 133, 243 , 1)',
		},

		visitorsLegend: {
			firstIcon: 'linear-gradient(90deg, #0088ff 0%, #3dafff 100%)',
			secondIcon: 'linear-gradient(90deg, #a454ff 0%, #7659ff 100%)',
		},

		visitorsPie: {
			firstPieGradientLeft: '#7bff24',
			firstPieGradientRight: '#2ec7fe',
			firstPieShadowColor: '#19977E',
			firstPieRadius: ['70%', '90%'],

			secondPieGradientLeft: '#ff894a',
			secondPieGradientRight: '#ffcc10',
			secondPieShadowColor: '#cf7c1c',
			secondPieRadius: ['60%', '95%'],
			shadowOffsetX: '0',
			shadowOffsetY: '3',
		},

		visitorsPieLegend: {
			firstSection: 'linear-gradient(90deg, #ffcb17 0%, #ff874c 100%)',
			secondSection: 'linear-gradient(90deg, #00c7c7 0%, #00d977 100%)',
		},

		earningPie: {
			radius: ['65%', '100%'],
			center: ['50%', '50%'],

			fontSize: '22',

			firstPieGradientLeft: '#00d77f',
			firstPieGradientRight: '#00d77f',
			firstPieShadowColor: 'rgba(0, 0, 0, 0)',

			secondPieGradientLeft: '#7756f7',
			secondPieGradientRight: '#7756f7',
			secondPieShadowColor: 'rgba(0, 0, 0, 0)',

			thirdPieGradientLeft: '#ffca00',
			thirdPieGradientRight: '#ffca00',
			thirdPieShadowColor: 'rgba(0, 0, 0, 0)',
		},

		earningLine: {
			gradFrom: 'rgba(118, 89, 255, 0.4)',
			gradTo: 'rgba(164, 84, 255, 0.5)',

			tooltipTextColor: '#ffffff',
			tooltipFontWeight: 'normal',
			tooltipFontSize: '16',
			tooltipBg: 'rgba(0, 255, 170, 0.35)',
			tooltipBorderColor: '#00d977',
			tooltipBorderWidth: '3',
			tooltipExtraCss:
				'box-shadow: 0px 2px 46px 0 rgba(0, 255, 170, 0.35); border-radius: 10px; padding: 4px 16px;',
		},
	},
};
