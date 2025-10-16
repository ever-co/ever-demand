import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import {
	Dialog,
	Portal,
	IconButton,
	Button,
	Paragraph,
} from 'react-native-paper';

// HELPERS
import { getReactComponentProps } from '../../helpers/utils';

// STYLES
import {
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
	GLOBAL_STYLE as GS,
} from '../../assets/ts/styles';

export const PaperDialogTitleProps = getReactComponentProps(Dialog.Title);
export const PaperButtonProps = getReactComponentProps(Button);
export const PaperParagraphProps = getReactComponentProps(Paragraph);
export interface DialogType {
	visible: boolean;
	title?: string;
	titleProps?: typeof PaperDialogTitleProps;
	message?: React.ReactNode;
	style?: ViewStyle;
	contentStyle?: ViewStyle;
	actionStyle?: ViewStyle;
	children?: React.ReactNode;
	showCloseBtn?: boolean;
	actions?: typeof PaperButtonProps[];
	onDismiss: () => void;
}

const CustomDialog: React.FC<DialogType> = ({
	visible = false,
	title,
	titleProps = {},
	message,
	style = {},
	contentStyle = {},
	actionStyle = {},
	children,
	showCloseBtn = true,
	actions,
	onDismiss = () => {},
}) => {
	// DATA
	const STYLES = StyleSheet.create({
		style: {
			...GS.pt2,
			borderRadius: CS.SPACE_SM,
			overflow: 'hidden',
			...style,
		},
		contentStyle: {
			...contentStyle,
		},
		actionStyle: {
			...actionStyle,
		},
		closeBtn: {
			...GS.mr2,
			...GS.mt2,
			position: 'absolute',
			top: 0,
			right: 0,
		},
		contentContainer: { width: '100%' },
	});

	return (
		<Portal>
			<Dialog
				visible={visible}
				onDismiss={onDismiss}
				style={STYLES.style}>
				{showCloseBtn && (
					<IconButton
						style={STYLES.closeBtn}
						onPress={onDismiss}
						icon={'x'}
						size={CS.FONT_SIZE}
						color={CC.dark}
					/>
				)}
				{title && titleProps && (
					<Dialog.Title
						{...{
							...titleProps,
							style: { color: CC.primary },
						}}>
						{title}
					</Dialog.Title>
				)}

				<Dialog.Content style={STYLES.contentStyle}>
					{!!children && children}
					{!!message && !children && (
						<Paragraph style={{ ...GS.txtPrimary }}>
							{message}
						</Paragraph>
					)}
				</Dialog.Content>

				{actions && (
					<Dialog.Actions style={STYLES.actionStyle}>
						{actions.map((item, index) => (
							<Button key={index} {...item} />
						))}
					</Dialog.Actions>
				)}
			</Dialog>
		</Portal>
	);
};

export default CustomDialog;
