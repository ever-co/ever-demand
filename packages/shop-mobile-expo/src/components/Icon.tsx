import AntDesign from '@expo/vector-icons/AntDesign';

export type IconElementType = typeof AntDesign;
export type IconNameType = keyof typeof AntDesign.glyphMap;
export type IconSizeType = keyof typeof AntDesign.defaultProps;

const Icon: IconElementType = AntDesign;

export default Icon;
