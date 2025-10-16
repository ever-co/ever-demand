export type GroupNameType = 'APP' | 'LOADING' | 'BLANK' | 'REGISTRATION';
export type NavigationGroupType = GroupNameType | null;
export type NavigationStateType = {
	group: GroupNameType | null;
};
