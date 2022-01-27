export type GroupNameType = 'APP' | 'LOADING' | 'BLANK';
export type NavigationGroupType = GroupNameType | null;
export type NavigationStateType = {
	group: GroupNameType | null;
};
