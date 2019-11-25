// tslint:disable

type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	/** A date string, such as 2007-12-03, compliant with the ISO 8601 standard  for
	 * representation of dates and times using the Gregorian calendar.
	 */
	Date: any;
	Ever_Date: any;
	Ever_Any: any;
	Ever_Void: any;
};

export type Dependencies_2 = {
	name?: Maybe<Scalars['String']>;
	version?: Maybe<Scalars['String']>;
};

export type DevDependencies_2 = {
	name?: Maybe<Scalars['String']>;
	version?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type Directory = Node & {
	/** The id of this node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
	internal?: Maybe<Internal_9>;
	sourceInstanceName?: Maybe<Scalars['String']>;
	absolutePath?: Maybe<Scalars['String']>;
	relativePath?: Maybe<Scalars['String']>;
	extension?: Maybe<Scalars['String']>;
	size?: Maybe<Scalars['Int']>;
	prettySize?: Maybe<Scalars['String']>;
	modifiedTime?: Maybe<Scalars['Date']>;
	accessTime?: Maybe<Scalars['Date']>;
	changeTime?: Maybe<Scalars['Date']>;
	birthTime?: Maybe<Scalars['Date']>;
	root?: Maybe<Scalars['String']>;
	dir?: Maybe<Scalars['String']>;
	base?: Maybe<Scalars['String']>;
	ext?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	relativeDirectory?: Maybe<Scalars['String']>;
	dev?: Maybe<Scalars['Int']>;
	mode?: Maybe<Scalars['Int']>;
	nlink?: Maybe<Scalars['Int']>;
	uid?: Maybe<Scalars['Int']>;
	gid?: Maybe<Scalars['Int']>;
	rdev?: Maybe<Scalars['Int']>;
	ino?: Maybe<Scalars['Float']>;
	atimeMs?: Maybe<Scalars['Float']>;
	mtimeMs?: Maybe<Scalars['Float']>;
	ctimeMs?: Maybe<Scalars['Float']>;
	birthtimeMs?: Maybe<Scalars['Float']>;
	atime?: Maybe<Scalars['Date']>;
	mtime?: Maybe<Scalars['Date']>;
	ctime?: Maybe<Scalars['Date']>;
	birthtime?: Maybe<Scalars['Date']>;
};

/** Node of type Directory */
export type DirectoryModifiedTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryAccessTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryChangeTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryBirthTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryAtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryMtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryCtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Directory */
export type DirectoryBirthtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

export type DirectoryAbsolutePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryAccessTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryAtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryAtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryBaseQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryBirthtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryBirthtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryBirthTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryChangeTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** A connection to a list of items. */
export type DirectoryConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<DirectoryEdge>>>;
	totalCount?: Maybe<Scalars['Int']>;
	distinct?: Maybe<Array<Maybe<Scalars['String']>>>;
	group?: Maybe<Array<Maybe<DirectoryGroupConnectionConnection>>>;
};

/** A connection to a list of items. */
export type DirectoryConnectionDistinctArgs = {
	field?: Maybe<DirectoryDistinctEnum>;
};

/** A connection to a list of items. */
export type DirectoryConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	field?: Maybe<DirectoryGroupEnum>;
};

export type DirectoryConnectionAbsolutePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionAccessTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionAtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryConnectionAtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionBaseQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionBirthtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryConnectionBirthtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionBirthTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionChangeTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionCtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryConnectionCtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionDevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryConnectionDirQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionExtensionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionExtQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionGidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryConnectionIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionInoQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryConnectionInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionInternalDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionInternalInputObject_2 = {
	contentDigest?: Maybe<DirectoryConnectionInternalContentDigestQueryString_2>;
	type?: Maybe<DirectoryConnectionInternalTypeQueryString_2>;
	description?: Maybe<DirectoryConnectionInternalDescriptionQueryString_2>;
	owner?: Maybe<DirectoryConnectionInternalOwnerQueryString_2>;
};

export type DirectoryConnectionInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionModeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryConnectionModifiedTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionMtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryConnectionMtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionNlinkQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryConnectionPrettySizeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionRdevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryConnectionRelativeDirectoryQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionRelativePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionRootQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionSizeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryConnectionSort = {
	fields: Array<Maybe<DirectoryConnectionSortByFieldsEnum>>;
	order?: Maybe<Array<Maybe<DirectoryConnectionSortOrderValues>>>;
};

export enum DirectoryConnectionSortByFieldsEnum {
	Id = 'id',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
	SourceInstanceName = 'sourceInstanceName',
	AbsolutePath = 'absolutePath',
	RelativePath = 'relativePath',
	Extension = 'extension',
	Size = 'size',
	PrettySize = 'prettySize',
	ModifiedTime = 'modifiedTime',
	AccessTime = 'accessTime',
	ChangeTime = 'changeTime',
	BirthTime = 'birthTime',
	Root = 'root',
	Dir = 'dir',
	Base = 'base',
	Ext = 'ext',
	Name = 'name',
	RelativeDirectory = 'relativeDirectory',
	Dev = 'dev',
	Mode = 'mode',
	Nlink = 'nlink',
	Uid = 'uid',
	Gid = 'gid',
	Rdev = 'rdev',
	Ino = 'ino',
	AtimeMs = 'atimeMs',
	MtimeMs = 'mtimeMs',
	CtimeMs = 'ctimeMs',
	BirthtimeMs = 'birthtimeMs',
	Atime = 'atime',
	Mtime = 'mtime',
	Ctime = 'ctime',
	Birthtime = 'birthtime',
}

export enum DirectoryConnectionSortOrderValues {
	Asc = 'ASC',
	Desc = 'DESC',
}

export type DirectoryConnectionSourceInstanceNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryConnectionUidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryCtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryCtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryDevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryDirQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum DirectoryDistinctEnum {
	Id = 'id',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
	SourceInstanceName = 'sourceInstanceName',
	AbsolutePath = 'absolutePath',
	RelativePath = 'relativePath',
	Extension = 'extension',
	Size = 'size',
	PrettySize = 'prettySize',
	ModifiedTime = 'modifiedTime',
	AccessTime = 'accessTime',
	ChangeTime = 'changeTime',
	BirthTime = 'birthTime',
	Root = 'root',
	Dir = 'dir',
	Base = 'base',
	Ext = 'ext',
	Name = 'name',
	RelativeDirectory = 'relativeDirectory',
	Dev = 'dev',
	Mode = 'mode',
	Nlink = 'nlink',
	Uid = 'uid',
	Gid = 'gid',
	Rdev = 'rdev',
	Ino = 'ino',
	AtimeMs = 'atimeMs',
	MtimeMs = 'mtimeMs',
	CtimeMs = 'ctimeMs',
	BirthtimeMs = 'birthtimeMs',
	Atime = 'atime',
	Mtime = 'mtime',
	Ctime = 'ctime',
	Birthtime = 'birthtime',
}

/** An edge in a connection. */
export type DirectoryEdge = {
	/** The item at the end of the edge */
	node?: Maybe<Directory>;
	/** The next edge in the connection */
	next?: Maybe<Directory>;
	/** The previous edge in the connection */
	previous?: Maybe<Directory>;
};

export type DirectoryExtensionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryExtQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryGidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

/** A connection to a list of items. */
export type DirectoryGroupConnectionConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<DirectoryGroupConnectionEdge>>>;
	field?: Maybe<Scalars['String']>;
	fieldValue?: Maybe<Scalars['String']>;
	totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type DirectoryGroupConnectionEdge = {
	/** The item at the end of the edge */
	node?: Maybe<Directory>;
	/** The next edge in the connection */
	next?: Maybe<Directory>;
	/** The previous edge in the connection */
	previous?: Maybe<Directory>;
};

export enum DirectoryGroupEnum {
	Id = 'id',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
	SourceInstanceName = 'sourceInstanceName',
	AbsolutePath = 'absolutePath',
	RelativePath = 'relativePath',
	Extension = 'extension',
	Size = 'size',
	PrettySize = 'prettySize',
	ModifiedTime = 'modifiedTime',
	AccessTime = 'accessTime',
	ChangeTime = 'changeTime',
	BirthTime = 'birthTime',
	Root = 'root',
	Dir = 'dir',
	Base = 'base',
	Ext = 'ext',
	Name = 'name',
	RelativeDirectory = 'relativeDirectory',
	Dev = 'dev',
	Mode = 'mode',
	Nlink = 'nlink',
	Uid = 'uid',
	Gid = 'gid',
	Rdev = 'rdev',
	Ino = 'ino',
	AtimeMs = 'atimeMs',
	MtimeMs = 'mtimeMs',
	CtimeMs = 'ctimeMs',
	BirthtimeMs = 'birthtimeMs',
	Atime = 'atime',
	Mtime = 'mtime',
	Ctime = 'ctime',
	Birthtime = 'birthtime',
}

export type DirectoryIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryInoQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryInternalDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryInternalInputObject_2 = {
	contentDigest?: Maybe<DirectoryInternalContentDigestQueryString_2>;
	type?: Maybe<DirectoryInternalTypeQueryString_2>;
	description?: Maybe<DirectoryInternalDescriptionQueryString_2>;
	owner?: Maybe<DirectoryInternalOwnerQueryString_2>;
};

export type DirectoryInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryModeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryModifiedTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryMtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type DirectoryMtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryNlinkQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryPrettySizeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryRdevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectoryRelativeDirectoryQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryRelativePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryRootQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectorySizeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DirectorySourceInstanceNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DirectoryUidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type DuotoneGradient = {
	highlight?: Maybe<Scalars['String']>;
	shadow?: Maybe<Scalars['String']>;
	opacity?: Maybe<Scalars['Int']>;
};

export type Ever = {
	adminByEmail?: Maybe<Ever_Admin>;
	admin?: Maybe<Ever_Admin>;
	adminAuthenticated: Scalars['Boolean'];
	getCarrierByUsername?: Maybe<Ever_Carrier>;
	getCarrier?: Maybe<Ever_Carrier>;
	getCarriers: Array<Ever_Carrier>;
	getActiveCarriers: Array<Maybe<Ever_Carrier>>;
	getCountOfCarriers: Scalars['Int'];
	getCarrierOrders: Array<Ever_CarrierOrder>;
	getCarrierCurrentOrder?: Maybe<Ever_Order>;
	getCarrierOrdersHistory: Array<Maybe<Ever_Order>>;
	getCountOfCarrierOrdersHistory: Scalars['Int'];
	currencies?: Maybe<Array<Maybe<Ever_Currency>>>;
	clearAll: Scalars['Boolean'];
	device?: Maybe<Ever_Device>;
	devices: Array<Ever_Device>;
	geoLocationProducts?: Maybe<Array<Maybe<Ever_ProductInfo>>>;
	geoLocationProductsByPaging: Array<Maybe<Ever_ProductInfo>>;
	getCountOfGeoLocationProducts: Scalars['Int'];
	invite?: Maybe<Ever_Invite>;
	invites: Array<Ever_Invite>;
	getInviteByCode?: Maybe<Ever_Invite>;
	getInviteByLocation?: Maybe<Ever_Invite>;
	generate1000InvitesConnectedToInviteRequests?: Maybe<Scalars['Ever_Void']>;
	getCountOfInvites: Scalars['Int'];
	inviteRequest?: Maybe<Ever_InviteRequest>;
	invitesRequests?: Maybe<Array<Ever_InviteRequest>>;
	notifyAboutLaunch?: Maybe<Scalars['Ever_Void']>;
	generate1000InviteRequests?: Maybe<Scalars['Ever_Void']>;
	getCountOfInvitesRequests: Scalars['Int'];
	getOrder?: Maybe<Ever_Order>;
	orders: Array<Ever_Order>;
	getDashboardCompletedOrders: Array<Ever_DashboardCompletedOrder>;
	getDashboardCompletedOrdersToday: Array<Ever_Order>;
	getOrdersChartTotalOrders: Array<Ever_OrderChartPanel>;
	getCompletedOrdersInfo: Ever_CompletedOrderInfo;
	getOrderedUsersInfo: Array<Ever_OrderedUserInfo>;
	generateOrdersByCustomerId?: Maybe<Scalars['Ever_Void']>;
	addTakenOrders?: Maybe<Scalars['Ever_Void']>;
	addOrdersToTake?: Maybe<Scalars['Ever_Void']>;
	generateActiveAndAvailableOrdersPerCarrier?: Maybe<Scalars['Ever_Void']>;
	generatePastOrdersPerCarrier?: Maybe<Scalars['Ever_Void']>;
	getUsersOrdersCountInfo?: Maybe<Array<Maybe<Ever_OrderCountTnfo>>>;
	getMerchantsOrdersCountInfo?: Maybe<Array<Maybe<Ever_OrderCountTnfo>>>;
	generateRandomOrdersCurrentStore: Ever_GenerateOrdersResponse;
	product?: Maybe<Ever_Product>;
	products?: Maybe<Array<Ever_Product>>;
	getCountOfProducts: Scalars['Int'];
	user?: Maybe<Ever_User>;
	users: Array<Maybe<Ever_User>>;
	getOrders: Array<Ever_Order>;
	isUserExists: Scalars['Boolean'];
	getSocial?: Maybe<Ever_User>;
	isUserEmailExists: Scalars['Boolean'];
	generate1000Customers?: Maybe<Ever_ResponseGenerate1000Customers>;
	getCountOfUsers: Scalars['Int'];
	getCustomerMetrics?: Maybe<Ever_CustomerMetrics>;
	warehouse?: Maybe<Ever_Warehouse>;
	warehouses: Array<Maybe<Ever_Warehouse>>;
	nearbyStores: Array<Ever_Warehouse>;
	countStoreCustomers: Scalars['Int'];
	getAllActiveStores: Array<Ever_Warehouse>;
	getStoreCustomers: Array<Ever_User>;
	getStoreProducts: Array<Ever_WarehouseProduct>;
	getStoreAvailableProducts: Array<Ever_WarehouseProduct>;
	getCountExistingCustomers: Ever_ExistingCustomersByStores;
	getCountExistingCustomersToday: Ever_ExistingCustomersByStores;
	hasExistingStores: Scalars['Boolean'];
	getCountOfMerchants: Scalars['Int'];
	getAllStores: Array<Ever_Warehouse>;
	getMerchantsBuyName: Array<Maybe<Ever_Warehouse>>;
	getStoreCarriers?: Maybe<Array<Ever_Carrier>>;
	getStoreOrders: Array<Ever_Order>;
	getNextOrderNumber: Scalars['Int'];
	getDashboardOrdersChartOrders: Array<Ever_Order>;
	getMerchantsOrders?: Maybe<Array<Maybe<Ever_MerchantsOrders>>>;
	getStoreOrdersTableData: Ever_StoreOrdersTableData;
	getCountOfStoreOrders: Scalars['Int'];
	getOrdersInDelivery: Array<Maybe<Ever_Order>>;
	removeUserOrders?: Maybe<Ever_RemovedUserOrdersObj>;
	getProductsWithPagination?: Maybe<Array<Ever_WarehouseProduct>>;
	getProductsCount?: Maybe<Scalars['Int']>;
	getWarehouseProduct?: Maybe<Ever_WarehouseProduct>;
	getCoseMerchants: Array<Maybe<Ever_Warehouse>>;
	getOrderForWork?: Maybe<Ever_Order>;
	getOrdersForWork: Array<Maybe<Ever_Order>>;
	getCountOfOrdersForWork: Scalars['Int'];
	productsCategory?: Maybe<Ever_ProductsCategory>;
	productsCategories: Array<Ever_ProductsCategory>;
	temp__?: Maybe<Scalars['Boolean']>;
};

export type EverAdminByEmailArgs = {
	email: Scalars['String'];
};

export type EverAdminArgs = {
	id: Scalars['String'];
};

export type EverGetCarrierByUsernameArgs = {
	username: Scalars['String'];
};

export type EverGetCarrierArgs = {
	id: Scalars['String'];
};

export type EverGetCarriersArgs = {
	carriersFindInput?: Maybe<Ever_CarriersFindInput>;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
};

export type EverGetCountOfCarriersArgs = {
	carriersFindInput?: Maybe<Ever_CarriersFindInput>;
};

export type EverGetCarrierOrdersArgs = {
	carrierId: Scalars['String'];
	options?: Maybe<Ever_CarrierOrdersOptions>;
};

export type EverGetCarrierCurrentOrderArgs = {
	carrierId: Scalars['String'];
};

export type EverGetCarrierOrdersHistoryArgs = {
	carrierId: Scalars['String'];
	options?: Maybe<Ever_GeoLocationOrdersOptions>;
};

export type EverGetCountOfCarrierOrdersHistoryArgs = {
	carrierId: Scalars['String'];
};

export type EverDeviceArgs = {
	id?: Maybe<Scalars['String']>;
};

export type EverDevicesArgs = {
	findInput?: Maybe<Ever_DeviceFindInput>;
};

export type EverGeoLocationProductsArgs = {
	geoLocation: Ever_GeoLocationFindInput;
};

export type EverGeoLocationProductsByPagingArgs = {
	geoLocation: Ever_GeoLocationFindInput;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
	options?: Maybe<Ever_GetGeoLocationProductsOptions>;
	searchText?: Maybe<Scalars['String']>;
};

export type EverGetCountOfGeoLocationProductsArgs = {
	geoLocation: Ever_GeoLocationFindInput;
	options?: Maybe<Ever_GetGeoLocationProductsOptions>;
	searchText?: Maybe<Scalars['String']>;
};

export type EverInviteArgs = {
	id: Scalars['String'];
};

export type EverInvitesArgs = {
	findInput?: Maybe<Ever_InvitesFindInput>;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
};

export type EverGetInviteByCodeArgs = {
	info: Ever_InviteByCodeInput;
};

export type EverGetInviteByLocationArgs = {
	info?: Maybe<Ever_InviteByLocationInput>;
};

export type EverGenerate1000InvitesConnectedToInviteRequestsArgs = {
	defaultLng: Scalars['Float'];
	defaultLat: Scalars['Float'];
};

export type EverInviteRequestArgs = {
	id: Scalars['String'];
};

export type EverInvitesRequestsArgs = {
	findInput?: Maybe<Ever_InvitesRequestsFindInput>;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
	invited?: Maybe<Scalars['Boolean']>;
};

export type EverNotifyAboutLaunchArgs = {
	invite?: Maybe<Ever_InviteInput>;
	devicesIds: Array<Scalars['String']>;
};

export type EverGenerate1000InviteRequestsArgs = {
	defaultLng: Scalars['Float'];
	defaultLat: Scalars['Float'];
};

export type EverGetCountOfInvitesRequestsArgs = {
	invited?: Maybe<Scalars['Boolean']>;
};

export type EverGetOrderArgs = {
	id: Scalars['String'];
};

export type EverOrdersArgs = {
	findInput?: Maybe<Ever_OrdersFindInput>;
};

export type EverGetCompletedOrdersInfoArgs = {
	storeId?: Maybe<Scalars['String']>;
};

export type EverGetOrderedUsersInfoArgs = {
	storeId: Scalars['String'];
};

export type EverGenerateOrdersByCustomerIdArgs = {
	numberOfOrders: Scalars['Int'];
	customerId: Scalars['String'];
};

export type EverAddTakenOrdersArgs = {
	carrierIds: Array<Scalars['String']>;
};

export type EverGetUsersOrdersCountInfoArgs = {
	usersIds?: Maybe<Array<Scalars['String']>>;
};

export type EverGetMerchantsOrdersCountInfoArgs = {
	merchantsIds?: Maybe<Array<Scalars['String']>>;
};

export type EverGenerateRandomOrdersCurrentStoreArgs = {
	storeId: Scalars['String'];
	storeCreatedAt: Scalars['Ever_Date'];
	ordersLimit: Scalars['Int'];
};

export type EverProductArgs = {
	id: Scalars['String'];
};

export type EverProductsArgs = {
	findInput?: Maybe<Ever_ProductsFindInput>;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
	existedProductsIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type EverGetCountOfProductsArgs = {
	existedProductsIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type EverUserArgs = {
	id: Scalars['String'];
};

export type EverUsersArgs = {
	findInput?: Maybe<Ever_UserFindInput>;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
};

export type EverGetOrdersArgs = {
	userId: Scalars['String'];
};

export type EverIsUserExistsArgs = {
	conditions: Ever_UserMemberInput;
};

export type EverGetSocialArgs = {
	socialId: Scalars['String'];
};

export type EverIsUserEmailExistsArgs = {
	email: Scalars['String'];
};

export type EverGenerate1000CustomersArgs = {
	defaultLng: Scalars['Float'];
	defaultLat: Scalars['Float'];
};

export type EverGetCustomerMetricsArgs = {
	id: Scalars['String'];
};

export type EverWarehouseArgs = {
	id: Scalars['String'];
};

export type EverWarehousesArgs = {
	findInput?: Maybe<Ever_WarehousesFindInput>;
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
};

export type EverNearbyStoresArgs = {
	geoLocation: Ever_GeoLocationFindInput;
};

export type EverCountStoreCustomersArgs = {
	storeId: Scalars['String'];
};

export type EverGetAllActiveStoresArgs = {
	fullProducts: Scalars['Boolean'];
};

export type EverGetStoreCustomersArgs = {
	storeId: Scalars['String'];
};

export type EverGetStoreProductsArgs = {
	storeId: Scalars['String'];
	fullProducts: Scalars['Boolean'];
};

export type EverGetStoreAvailableProductsArgs = {
	storeId: Scalars['String'];
};

export type EverGetMerchantsBuyNameArgs = {
	searchName: Scalars['String'];
	geoLocation?: Maybe<Ever_GeoLocationFindInput>;
};

export type EverGetStoreCarriersArgs = {
	storeId: Scalars['String'];
};

export type EverGetStoreOrdersArgs = {
	storeId: Scalars['String'];
};

export type EverGetNextOrderNumberArgs = {
	storeId: Scalars['String'];
};

export type EverGetDashboardOrdersChartOrdersArgs = {
	storeId: Scalars['String'];
};

export type EverGetStoreOrdersTableDataArgs = {
	storeId: Scalars['String'];
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
	status?: Maybe<Scalars['String']>;
};

export type EverGetCountOfStoreOrdersArgs = {
	storeId: Scalars['String'];
	status: Scalars['String'];
};

export type EverGetOrdersInDeliveryArgs = {
	storeId: Scalars['String'];
};

export type EverRemoveUserOrdersArgs = {
	storeId: Scalars['String'];
	userId: Scalars['String'];
};

export type EverGetProductsWithPaginationArgs = {
	id: Scalars['String'];
	pagingOptions?: Maybe<Ever_PagingOptionsInput>;
};

export type EverGetProductsCountArgs = {
	id: Scalars['String'];
};

export type EverGetWarehouseProductArgs = {
	warehouseId: Scalars['String'];
	warehouseProductId: Scalars['String'];
};

export type EverGetCoseMerchantsArgs = {
	geoLocation: Ever_GeoLocationFindInput;
};

export type EverGetOrderForWorkArgs = {
	geoLocation: Ever_GeoLocationFindInput;
	skippedOrderIds: Array<Scalars['String']>;
	options?: Maybe<Ever_GeoLocationOrdersOptions>;
	searchObj?: Maybe<Ever_SearchOrdersForWork>;
};

export type EverGetOrdersForWorkArgs = {
	geoLocation: Ever_GeoLocationFindInput;
	skippedOrderIds: Array<Scalars['String']>;
	options?: Maybe<Ever_GeoLocationOrdersOptions>;
	searchObj?: Maybe<Ever_SearchOrdersForWork>;
};

export type EverGetCountOfOrdersForWorkArgs = {
	geoLocation: Ever_GeoLocationFindInput;
	skippedOrderIds: Array<Scalars['String']>;
	searchObj?: Maybe<Ever_SearchOrdersForWork>;
};

export type EverProductsCategoryArgs = {
	id: Scalars['String'];
};

export type EverProductsCategoriesArgs = {
	findInput?: Maybe<Ever_ProductsCategoriesFindInput>;
};

export type Ever_AdditionalUserRegistrationInfo = {
	email: Scalars['String'];
	password: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
};

export type Ever_Admin = {
	_id: Scalars['String'];
	id: Scalars['String'];
	name: Scalars['String'];
	email: Scalars['String'];
	pictureUrl: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type Ever_AdminCreateInput = {
	name: Scalars['String'];
	email: Scalars['String'];
	pictureUrl: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type Ever_AdminLoginInfo = {
	admin: Ever_Admin;
	token: Scalars['String'];
};

export type Ever_AdminPasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type Ever_AdminRegisterInput = {
	admin: Ever_AdminCreateInput;
	password: Scalars['String'];
};

export type Ever_AdminUpdateInput = {
	name?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	pictureUrl?: Maybe<Scalars['String']>;
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type Ever_Carrier = {
	_id: Scalars['String'];
	id: Scalars['String'];
	firstName: Scalars['String'];
	lastName: Scalars['String'];
	username: Scalars['String'];
	phone: Scalars['String'];
	logo: Scalars['String'];
	email?: Maybe<Scalars['String']>;
	numberOfDeliveries: Scalars['Int'];
	skippedOrderIds?: Maybe<Array<Scalars['String']>>;
	status: Scalars['Int'];
	geoLocation: Ever_GeoLocation;
	devicesIds: Array<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
	isActive?: Maybe<Scalars['Boolean']>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	devices: Array<Ever_Device>;
	isDeleted: Scalars['Boolean'];
};

export type Ever_CarrierCreateInput = {
	email?: Maybe<Scalars['String']>;
	firstName: Scalars['String'];
	lastName: Scalars['String'];
	geoLocation: Ever_GeoLocationCreateInput;
	status?: Maybe<Scalars['Int']>;
	username: Scalars['String'];
	password: Scalars['String'];
	phone: Scalars['String'];
	logo: Scalars['String'];
	numberOfDeliveries?: Maybe<Scalars['Int']>;
	skippedOrderIds?: Maybe<Array<Scalars['String']>>;
	deliveriesCountToday?: Maybe<Scalars['Int']>;
	totalDistanceToday?: Maybe<Scalars['Float']>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	devicesIds?: Maybe<Array<Scalars['String']>>;
	isDeleted?: Maybe<Scalars['Boolean']>;
};

export type Ever_CarrierLoginInfo = {
	carrier: Ever_Carrier;
	token: Scalars['String'];
};

export type Ever_CarrierOrder = {
	_id: Scalars['String'];
	id: Scalars['String'];
	isConfirmed: Scalars['Boolean'];
	isCancelled: Scalars['Boolean'];
	isPaid: Scalars['Boolean'];
	warehouseStatus: Scalars['Int'];
	carrierStatus: Scalars['Int'];
	orderNumber: Scalars['Int'];
	_createdAt?: Maybe<Scalars['Ever_Date']>;
	user: Ever_CarrierOrderUser;
	warehouse: Ever_CarrierOrderWarehouse;
	carrier: Ever_CarrierOrderCarrier;
	products: Array<Ever_CarrierOrderProducts>;
};

export type Ever_CarrierOrderCarrier = {
	id: Scalars['String'];
};

export type Ever_CarrierOrderProducts = {
	count: Scalars['Int'];
	isManufacturing: Scalars['Boolean'];
	isCarrierRequired: Scalars['Boolean'];
	isDeliveryRequired: Scalars['Boolean'];
	isTakeaway?: Maybe<Scalars['Boolean']>;
	initialPrice: Scalars['Float'];
	price: Scalars['Float'];
	product: Ever_CarrierOrderProductsProduct;
};

export type Ever_CarrierOrderProductsProduct = {
	_id: Scalars['String'];
	id: Scalars['String'];
	title: Array<Ever_TranslateType>;
	description: Array<Ever_TranslateType>;
	details: Array<Ever_TranslateType>;
	images: Array<Ever_ImageType>;
	categories?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Ever_CarrierOrdersOptions = {
	populateWarehouse: Scalars['Boolean'];
	completion: Scalars['String'];
};

export type Ever_CarrierOrderUser = {
	_id: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	geoLocation: Ever_GeoLocation;
};

export type Ever_CarrierOrderWarehouse = {
	logo: Scalars['String'];
	name: Scalars['String'];
	geoLocation: Ever_GeoLocation;
};

export type Ever_CarrierPasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type Ever_CarrierRegisterInput = {
	carrier: Ever_CarrierCreateInput;
	password: Scalars['String'];
};

export type Ever_CarriersFindInput = {
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	isDeleted?: Maybe<Scalars['Boolean']>;
	status?: Maybe<Scalars['Int']>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	_id?: Maybe<Scalars['Ever_Any']>;
};

export enum Ever_CarrierStatus {
	Online = 'Online',
	Offline = 'Offline',
	Blocked = 'Blocked',
}

export type Ever_CarrierUpdateInput = {
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	geoLocation?: Maybe<Ever_GeoLocationUpdateInput>;
	status?: Maybe<Scalars['Int']>;
	username?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	logo?: Maybe<Scalars['String']>;
	numberOfDeliveries?: Maybe<Scalars['Int']>;
	skippedOrderIds?: Maybe<Array<Scalars['String']>>;
	deliveriesCountToday?: Maybe<Scalars['Int']>;
	totalDistanceToday?: Maybe<Scalars['Float']>;
	devicesIds?: Maybe<Array<Scalars['String']>>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	isActive?: Maybe<Scalars['Boolean']>;
};

export type Ever_Category = {
	id?: Maybe<Scalars['String']>;
	name: Array<Ever_TranslateType>;
};

export type Ever_CompletedOrderInfo = {
	totalOrders: Scalars['Int'];
	totalRevenue: Scalars['Float'];
};

export type Ever_Currency = {
	_id: Scalars['String'];
	currencyCode: Scalars['String'];
};

export type Ever_CurrencyCreateInput = {
	currencyCode: Scalars['String'];
};

export type Ever_CustomerMetrics = {
	totalOrders?: Maybe<Scalars['Int']>;
	canceledOrders?: Maybe<Scalars['Int']>;
	completedOrdersTotalSum?: Maybe<Scalars['Float']>;
};

export type Ever_CustomersByStore = {
	storeId: Scalars['String'];
	customersCount: Scalars['Int'];
};

export type Ever_DashboardCompletedOrder = {
	warehouseId: Scalars['String'];
	totalPrice: Scalars['Float'];
};

export type Ever_Device = {
	_id: Scalars['String'];
	id: Scalars['String'];
	channelId?: Maybe<Scalars['String']>;
	type: Scalars['String'];
	uuid: Scalars['String'];
	language?: Maybe<Scalars['String']>;
};

export type Ever_DeviceCreateInput = {
	channelId: Scalars['String'];
	language?: Maybe<Scalars['String']>;
	type: Scalars['String'];
	uuid: Scalars['String'];
};

export type Ever_DeviceFindInput = {
	channelId?: Maybe<Scalars['String']>;
	language?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	uuid?: Maybe<Scalars['String']>;
};

export type Ever_DeviceUpdateInput = {
	channelId?: Maybe<Scalars['String']>;
	language?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	uuid?: Maybe<Scalars['String']>;
};

export type Ever_ExistingCustomersByStores = {
	total: Scalars['Int'];
	perStore: Array<Ever_CustomersByStore>;
};

export type Ever_GenerateOrdersResponse = {
	error: Scalars['Boolean'];
	message?: Maybe<Scalars['String']>;
};

export type Ever_GeoLocation = {
	_id?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['String']>;
	_createdAt?: Maybe<Scalars['Ever_Date']>;
	createdAt?: Maybe<Scalars['Ever_Date']>;
	_updatedAt?: Maybe<Scalars['Ever_Date']>;
	updatedAt?: Maybe<Scalars['Ever_Date']>;
	countryId: Scalars['Int'];
	countryName?: Maybe<Scalars['String']>;
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
	loc: Ever_Loc;
	coordinates: Ever_GeoLocationCoordinates;
};

export type Ever_GeoLocationCoordinates = {
	lng: Scalars['Float'];
	lat: Scalars['Float'];
};

export type Ever_GeoLocationCreateInput = {
	countryId: Scalars['Int'];
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
	loc: Ever_LocInput;
};

export type Ever_GeoLocationCreateObject = {
	loc: Ever_Location;
	countryId: Scalars['Int'];
	city: Scalars['String'];
	postcode: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
};

export type Ever_GeoLocationFindInput = {
	countryId?: Maybe<Scalars['Int']>;
	city?: Maybe<Scalars['String']>;
	streetAddress?: Maybe<Scalars['String']>;
	house?: Maybe<Scalars['String']>;
	postcode?: Maybe<Scalars['String']>;
	loc?: Maybe<Ever_LocInput>;
};

export type Ever_GeoLocationInput = {
	countryId: Scalars['Int'];
	countryName?: Maybe<Scalars['String']>;
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
	loc: Ever_Location;
};

export type Ever_GeoLocationOrdersOptions = {
	sort?: Maybe<Scalars['String']>;
	limit?: Maybe<Scalars['Int']>;
	skip?: Maybe<Scalars['Int']>;
};

export type Ever_GeoLocationUpdateInput = {
	countryId?: Maybe<Scalars['Int']>;
	city?: Maybe<Scalars['String']>;
	streetAddress?: Maybe<Scalars['String']>;
	house?: Maybe<Scalars['String']>;
	postcode?: Maybe<Scalars['String']>;
	loc?: Maybe<Ever_LocInput>;
};

export type Ever_GeoLocationUpdateObjectInput = {
	loc: Ever_Location;
};

export type Ever_GetGeoLocationProductsOptions = {
	isDeliveryRequired?: Maybe<Scalars['Boolean']>;
	isTakeaway?: Maybe<Scalars['Boolean']>;
	merchantIds?: Maybe<Array<Maybe<Scalars['String']>>>;
	imageOrientation?: Maybe<Scalars['Int']>;
	locale?: Maybe<Scalars['String']>;
	withoutCount?: Maybe<Scalars['Boolean']>;
};

export type Ever_ImageInput = {
	locale: Scalars['String'];
	url: Scalars['String'];
	width: Scalars['Int'];
	height: Scalars['Int'];
	orientation: Scalars['Int'];
};

export type Ever_ImageType = {
	locale: Scalars['String'];
	url: Scalars['String'];
	width: Scalars['Int'];
	height: Scalars['Int'];
	orientation: Scalars['Int'];
};

export type Ever_Invite = {
	_id: Scalars['String'];
	id: Scalars['String'];
	code: Scalars['String'];
	apartment: Scalars['String'];
	geoLocation: Ever_GeoLocation;
};

export type Ever_InviteByCodeInput = {
	location: Ever_Location;
	inviteCode: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type Ever_InviteByLocationInput = {
	countryId: Scalars['Int'];
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	apartment: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
};

export type Ever_InviteCreateInput = {
	code?: Maybe<Scalars['String']>;
	apartment: Scalars['String'];
	geoLocation: Ever_GeoLocationCreateInput;
};

export type Ever_InviteInput = {
	code: Scalars['String'];
	apartment: Scalars['String'];
	geoLocation: Ever_GeoLocationInput;
	isDeleted: Scalars['Boolean'];
};

export type Ever_InviteRequest = {
	_id: Scalars['String'];
	id: Scalars['String'];
	apartment: Scalars['String'];
	geoLocation: Ever_GeoLocation;
	isManual?: Maybe<Scalars['Boolean']>;
	isInvited?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Ever_Date']>;
};

export type Ever_InviteRequestCreateInput = {
	apartment: Scalars['String'];
	geoLocation: Ever_GeoLocationCreateInput;
	isManual?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Ever_Date']>;
	isInvited?: Maybe<Scalars['Boolean']>;
};

export type Ever_InviteRequestUpdateInput = {
	apartment?: Maybe<Scalars['String']>;
	geoLocation?: Maybe<Ever_GeoLocationUpdateInput>;
	isManual?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Ever_Date']>;
	isInvited?: Maybe<Scalars['Boolean']>;
};

export type Ever_InvitesFindInput = {
	code?: Maybe<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
};

export type Ever_InvitesRequestsFindInput = {
	apartment?: Maybe<Scalars['String']>;
	isManual?: Maybe<Scalars['Boolean']>;
	isInvited?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Ever_Date']>;
};

export type Ever_InviteUpdateInput = {
	code?: Maybe<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
	geoLocation?: Maybe<Ever_GeoLocationUpdateInput>;
};

export enum Ever_Language {
	He_Il = 'he_IL',
	En_Us = 'en_US',
	Ru_Ru = 'ru_RU',
	Bg_Bg = 'bg_BG',
}

export type Ever_Loc = {
	type: Scalars['String'];
	coordinates: Array<Scalars['Float']>;
};

export type Ever_Location = {
	type: Scalars['String'];
	coordinates: Array<Scalars['Float']>;
};

export type Ever_LocInput = {
	type: Scalars['String'];
	coordinates: Array<Scalars['Float']>;
};

export type Ever_MerchantsOrders = {
	_id?: Maybe<Scalars['String']>;
	ordersCount?: Maybe<Scalars['Int']>;
};

export type Ever_MutationResponse = {
	success: Scalars['Boolean'];
	message?: Maybe<Scalars['String']>;
	data?: Maybe<Ever_Currency>;
};

export type Ever_Order = {
	_id: Scalars['String'];
	id: Scalars['String'];
	user: Ever_User;
	warehouse: Ever_Warehouse;
	warehouseId: Scalars['String'];
	carrier?: Maybe<Ever_Carrier>;
	carrierId?: Maybe<Scalars['String']>;
	products: Array<Ever_OrderProduct>;
	isConfirmed: Scalars['Boolean'];
	isCancelled: Scalars['Boolean'];
	isPaid: Scalars['Boolean'];
	isCompleted: Scalars['Boolean'];
	totalPrice: Scalars['Float'];
	orderType?: Maybe<Scalars['Int']>;
	deliveryTime?: Maybe<Scalars['Ever_Date']>;
	finishedProcessingTime?: Maybe<Scalars['Ever_Date']>;
	startDeliveryTime?: Maybe<Scalars['Ever_Date']>;
	deliveryTimeEstimate?: Maybe<Scalars['Int']>;
	warehouseStatus: Scalars['Int'];
	carrierStatus: Scalars['Int'];
	orderNumber: Scalars['Int'];
	carrierStatusText: Scalars['String'];
	warehouseStatusText: Scalars['String'];
	status?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['Ever_Date']>;
	_createdAt?: Maybe<Scalars['Ever_Date']>;
	updatedAt?: Maybe<Scalars['Ever_Date']>;
	_updatedAt?: Maybe<Scalars['Ever_Date']>;
};

export enum Ever_OrderCarrierStatus {
	NoCarrier = 'NoCarrier',
	CarrierSelectedOrder = 'CarrierSelectedOrder',
	CarrierPickedUpOrder = 'CarrierPickedUpOrder',
	CarrierStartDelivery = 'CarrierStartDelivery',
	CarrierArrivedToCustomer = 'CarrierArrivedToCustomer',
	DeliveryCompleted = 'DeliveryCompleted',
	IssuesDuringDelivery = 'IssuesDuringDelivery',
	ClientRefuseTakingOrder = 'ClientRefuseTakingOrder',
}

export type Ever_OrderChartPanel = {
	isCancelled: Scalars['Boolean'];
	isCompleted: Scalars['Boolean'];
	totalPrice: Scalars['Float'];
	_createdAt: Scalars['Ever_Date'];
};

export type Ever_OrderCountTnfo = {
	id?: Maybe<Scalars['String']>;
	ordersCount?: Maybe<Scalars['Int']>;
};

export type Ever_OrderCreateInput = {
	userId: Scalars['String'];
	warehouseId: Scalars['String'];
	products: Array<Ever_OrderProductCreateInput>;
	options?: Maybe<Ever_WarehouseOrdersRouterCreateOptions>;
};

export type Ever_OrderedUserInfo = {
	user: Ever_User;
	ordersCount: Scalars['Int'];
	totalPrice: Scalars['Float'];
};

export type Ever_OrderProduct = {
	_id: Scalars['String'];
	count: Scalars['Int'];
	isManufacturing: Scalars['Boolean'];
	isCarrierRequired: Scalars['Boolean'];
	isDeliveryRequired: Scalars['Boolean'];
	isTakeaway?: Maybe<Scalars['Boolean']>;
	initialPrice: Scalars['Float'];
	price: Scalars['Float'];
	product: Ever_Product;
};

export type Ever_OrderProductCreateInput = {
	count: Scalars['Int'];
	productId: Scalars['String'];
};

export type Ever_OrdersFindInput = {
	user?: Maybe<Scalars['String']>;
	warehouse?: Maybe<Scalars['String']>;
	carrier?: Maybe<Scalars['String']>;
	isConfirmed?: Maybe<Scalars['Boolean']>;
	isCancelled?: Maybe<Scalars['Boolean']>;
	isPaid?: Maybe<Scalars['Boolean']>;
	warehouseStatus: Scalars['Int'];
	carrierStatus: Scalars['Int'];
	orderNumber?: Maybe<Scalars['Int']>;
};

export enum Ever_OrderWarehouseStatus {
	NoStatus = 'NoStatus',
	ReadyForProcessing = 'ReadyForProcessing',
	WarehouseStartedProcessing = 'WarehouseStartedProcessing',
	AllocationStarted = 'AllocationStarted',
	AllocationFinished = 'AllocationFinished',
	PackagingStarted = 'PackagingStarted',
	PackagingFinished = 'PackagingFinished',
	GivenToCarrier = 'GivenToCarrier',
	AllocationFailed = 'AllocationFailed',
	PackagingFailed = 'PackagingFailed',
}

export type Ever_PagingOptionsInput = {
	sort?: Maybe<Ever_PagingSortInput>;
	limit?: Maybe<Scalars['Int']>;
	skip?: Maybe<Scalars['Int']>;
};

export type Ever_PagingSortInput = {
	field: Scalars['String'];
	sortBy: Scalars['String'];
};

export type Ever_Product = {
	_id: Scalars['String'];
	id: Scalars['String'];
	title: Array<Ever_TranslateType>;
	description: Array<Ever_TranslateType>;
	details: Array<Ever_TranslateType>;
	images: Array<Ever_ImageType>;
	categories?: Maybe<Array<Maybe<Scalars['String']>>>;
	detailsHTML: Array<Ever_TranslateType>;
	descriptionHTML: Array<Ever_TranslateType>;
	_createdAt?: Maybe<Scalars['Ever_Date']>;
	_updatedAt?: Maybe<Scalars['Ever_Date']>;
};

export type Ever_ProductCreateInput = {
	title: Array<Ever_TranslateInput>;
	description: Array<Ever_TranslateInput>;
	details?: Maybe<Array<Ever_TranslateInput>>;
	images: Array<Ever_ImageInput>;
	categories?: Maybe<Array<Ever_ProductsCategoryInput>>;
	detailsHTML?: Maybe<Array<Ever_TranslateInput>>;
	descriptionHTML?: Maybe<Array<Ever_TranslateInput>>;
};

export type Ever_ProductInfo = {
	warehouseProduct: Ever_WarehouseProduct;
	distance: Scalars['Float'];
	warehouseId: Scalars['String'];
	warehouseLogo: Scalars['String'];
};

export type Ever_ProductSaveInput = {
	_id: Scalars['String'];
	id?: Maybe<Scalars['String']>;
	title: Array<Ever_TranslateInput>;
	description: Array<Ever_TranslateInput>;
	details?: Maybe<Array<Ever_TranslateInput>>;
	images: Array<Ever_ImageInput>;
	categories?: Maybe<Array<Ever_ProductsCategoryInput>>;
	detailsHTML?: Maybe<Array<Ever_TranslateInput>>;
	descriptionHTML?: Maybe<Array<Ever_TranslateInput>>;
};

export type Ever_ProductsCategoriesCreateInput = {
	name: Array<Ever_TranslateInput>;
	image?: Maybe<Scalars['String']>;
};

export type Ever_ProductsCategoriesFindInput = {
	noop?: Maybe<Scalars['Ever_Void']>;
};

export type Ever_ProductsCategoriesUpdatenput = {
	name?: Maybe<Array<Ever_TranslateInput>>;
};

export type Ever_ProductsCategory = {
	_id: Scalars['String'];
	id: Scalars['String'];
	name: Array<Ever_TranslateType>;
	image?: Maybe<Scalars['String']>;
	_createdAt?: Maybe<Scalars['Ever_Date']>;
	_updatedAt?: Maybe<Scalars['Ever_Date']>;
};

export type Ever_ProductsCategoryInput = {
	_id: Scalars['String'];
	name?: Maybe<Array<Ever_TranslateInput>>;
};

export type Ever_ProductsFindInput = {
	title?: Maybe<Ever_TranslateInput>;
	description?: Maybe<Ever_TranslateInput>;
	details?: Maybe<Ever_TranslateInput>;
	image?: Maybe<Ever_ImageInput>;
};

export type Ever_QuantityUpdateInput = {
	change?: Maybe<Scalars['Int']>;
	to?: Maybe<Scalars['Int']>;
};

export type Ever_Remove = {
	n?: Maybe<Scalars['Int']>;
	ok?: Maybe<Scalars['Int']>;
};

export type Ever_RemovedUserOrdersObj = {
	number?: Maybe<Scalars['Int']>;
	modified?: Maybe<Scalars['Int']>;
};

export type Ever_ResponseGenerate1000Customers = {
	success: Scalars['Boolean'];
	message?: Maybe<Scalars['String']>;
};

export type Ever_SearchByRegex = {
	key: Scalars['String'];
	value: Scalars['String'];
};

export type Ever_SearchOrdersForWork = {
	byRegex?: Maybe<Array<Maybe<Ever_SearchByRegex>>>;
};

export type Ever_StoreOrdersTableData = {
	orders: Array<Maybe<Ever_Order>>;
	page: Scalars['Int'];
};

export type Ever_TranslateInput = {
	locale: Scalars['String'];
	value: Scalars['String'];
};

export type Ever_TranslateType = {
	locale: Scalars['String'];
	value: Scalars['String'];
};

export type Ever_User = {
	_id: Scalars['String'];
	id: Scalars['String'];
	geoLocation: Ever_GeoLocation;
	apartment: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	devicesIds: Array<Scalars['String']>;
	devices: Array<Ever_Device>;
	image?: Maybe<Scalars['String']>;
	fullAddress?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['Ever_Date']>;
	isBanned: Scalars['Boolean'];
};

export type Ever_UserCreateInput = {
	email?: Maybe<Scalars['String']>;
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	image?: Maybe<Scalars['String']>;
	geoLocation: Ever_GeoLocationCreateInput;
	apartment: Scalars['String'];
};

export type Ever_UserFindInput = {
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
	image?: Maybe<Scalars['String']>;
};

export type Ever_UserLoginInfo = {
	user: Ever_User;
	token: Scalars['String'];
};

export type Ever_UserMemberInput = {
	exceptCustomerId?: Maybe<Scalars['String']>;
	memberKey: Scalars['String'];
	memberValue: Scalars['String'];
};

export type Ever_UserPasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type Ever_UserRegisterInput = {
	user: Ever_UserCreateInput;
	password?: Maybe<Scalars['String']>;
};

export type Ever_UserUpdateObjectInput = {
	geoLocation: Ever_GeoLocationUpdateObjectInput;
	devicesIds?: Maybe<Array<Scalars['String']>>;
	apartment?: Maybe<Scalars['String']>;
	stripeCustomerId?: Maybe<Scalars['String']>;
};

export type Ever_Warehouse = {
	_id: Scalars['String'];
	id: Scalars['String'];
	_createdAt: Scalars['Ever_Date'];
	isActive: Scalars['Boolean'];
	isPaymentEnabled?: Maybe<Scalars['Boolean']>;
	geoLocation: Ever_GeoLocation;
	name: Scalars['String'];
	logo: Scalars['String'];
	username: Scalars['String'];
	contactEmail?: Maybe<Scalars['String']>;
	contactPhone?: Maybe<Scalars['String']>;
	forwardOrdersUsing?: Maybe<Array<Scalars['Int']>>;
	ordersEmail?: Maybe<Scalars['String']>;
	ordersPhone?: Maybe<Scalars['String']>;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	devicesIds: Array<Scalars['String']>;
	devices: Array<Ever_Device>;
	orders: Array<Ever_Order>;
	users: Array<Ever_User>;
	hasRestrictedCarriers?: Maybe<Scalars['Boolean']>;
	carriersIds?: Maybe<Array<Scalars['String']>>;
	usedCarriersIds?: Maybe<Array<Scalars['String']>>;
	carriers?: Maybe<Array<Ever_Carrier>>;
	orderBarcodeType?: Maybe<Scalars['Int']>;
};

export type Ever_WarehouseCreateInput = {
	geoLocation: Ever_GeoLocationCreateInput;
	name: Scalars['String'];
	logo: Scalars['String'];
	username: Scalars['String'];
	isActive?: Maybe<Scalars['Boolean']>;
	isPaymentEnabled?: Maybe<Scalars['Boolean']>;
	contactEmail?: Maybe<Scalars['String']>;
	contactPhone?: Maybe<Scalars['String']>;
	forwardOrdersUsing?: Maybe<Array<Scalars['Int']>>;
	ordersEmail?: Maybe<Scalars['String']>;
	ordersPhone?: Maybe<Scalars['String']>;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	hasRestrictedCarriers?: Maybe<Scalars['Boolean']>;
	carriersIds?: Maybe<Array<Scalars['String']>>;
	usedCarriersIds?: Maybe<Array<Scalars['String']>>;
};

export type Ever_WarehouseLoginInfo = {
	warehouse: Ever_Warehouse;
	token: Scalars['String'];
};

export type Ever_WarehouseOrdersRouterCreateOptions = {
	autoConfirm: Scalars['Boolean'];
};

export type Ever_WarehousePasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type Ever_WarehouseProduct = {
	id: Scalars['String'];
	_id: Scalars['String'];
	price: Scalars['Int'];
	initialPrice: Scalars['Int'];
	count?: Maybe<Scalars['Int']>;
	soldCount: Scalars['Int'];
	product: Ever_Product;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	isDeliveryRequired?: Maybe<Scalars['Boolean']>;
	isTakeaway?: Maybe<Scalars['Boolean']>;
	deliveryTimeMin?: Maybe<Scalars['Int']>;
	deliveryTimeMax?: Maybe<Scalars['Int']>;
};

export type Ever_WarehouseProductInput = {
	price: Scalars['Int'];
	initialPrice: Scalars['Int'];
	count?: Maybe<Scalars['Int']>;
	product: Scalars['String'];
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	isDeliveryRequired?: Maybe<Scalars['Boolean']>;
	isTakeaway?: Maybe<Scalars['Boolean']>;
	deliveryTimeMin?: Maybe<Scalars['Int']>;
	deliveryTimeMax?: Maybe<Scalars['Int']>;
};

export type Ever_WarehouseProductUpdateInput = {
	quantity?: Maybe<Ever_QuantityUpdateInput>;
	price?: Maybe<Scalars['Int']>;
};

export type Ever_WarehouseRegisterInput = {
	warehouse: Ever_WarehouseCreateInput;
	password: Scalars['String'];
};

export type Ever_WarehousesFindInput = {
	isActive?: Maybe<Scalars['Boolean']>;
	isPaymentEnabled?: Maybe<Scalars['Boolean']>;
	name?: Maybe<Scalars['String']>;
	logo?: Maybe<Scalars['String']>;
	username?: Maybe<Scalars['String']>;
	contactEmail?: Maybe<Scalars['String']>;
	contactPhone?: Maybe<Scalars['String']>;
	forwardOrdersUsing?: Maybe<Array<Maybe<Scalars['Int']>>>;
	ordersEmail?: Maybe<Scalars['String']>;
	ordersPhone?: Maybe<Scalars['String']>;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	hasRestrictedCarriers?: Maybe<Scalars['Boolean']>;
	carriersIds?: Maybe<Array<Scalars['String']>>;
	usedCarriersIds?: Maybe<Array<Scalars['String']>>;
};

/** Node of type File */
export type File = Node & {
	/** The id of this node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
	/** The child of this node of type imageSharp */
	childImageSharp?: Maybe<ImageSharp>;
	internal?: Maybe<Internal_10>;
	sourceInstanceName?: Maybe<Scalars['String']>;
	absolutePath?: Maybe<Scalars['String']>;
	relativePath?: Maybe<Scalars['String']>;
	extension?: Maybe<Scalars['String']>;
	size?: Maybe<Scalars['Int']>;
	prettySize?: Maybe<Scalars['String']>;
	modifiedTime?: Maybe<Scalars['Date']>;
	accessTime?: Maybe<Scalars['Date']>;
	changeTime?: Maybe<Scalars['Date']>;
	birthTime?: Maybe<Scalars['Date']>;
	root?: Maybe<Scalars['String']>;
	dir?: Maybe<Scalars['String']>;
	base?: Maybe<Scalars['String']>;
	ext?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	relativeDirectory?: Maybe<Scalars['String']>;
	dev?: Maybe<Scalars['Int']>;
	mode?: Maybe<Scalars['Int']>;
	nlink?: Maybe<Scalars['Int']>;
	uid?: Maybe<Scalars['Int']>;
	gid?: Maybe<Scalars['Int']>;
	rdev?: Maybe<Scalars['Int']>;
	ino?: Maybe<Scalars['Float']>;
	atimeMs?: Maybe<Scalars['Float']>;
	mtimeMs?: Maybe<Scalars['Float']>;
	ctimeMs?: Maybe<Scalars['Float']>;
	birthtimeMs?: Maybe<Scalars['Float']>;
	atime?: Maybe<Scalars['Date']>;
	mtime?: Maybe<Scalars['Date']>;
	ctime?: Maybe<Scalars['Date']>;
	birthtime?: Maybe<Scalars['Date']>;
	/** Copy file to static directory and return public url to it */
	publicURL?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileModifiedTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileAccessTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileChangeTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileBirthTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileAtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileMtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileCtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type File */
export type FileBirthtimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

export type FileAbsolutePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileAccessTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileAtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileAtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileBaseQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileBirthtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileBirthtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileBirthTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileChangeTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** A connection to a list of items. */
export type FileConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<FileEdge>>>;
	totalCount?: Maybe<Scalars['Int']>;
	distinct?: Maybe<Array<Maybe<Scalars['String']>>>;
	group?: Maybe<Array<Maybe<FileGroupConnectionConnection>>>;
};

/** A connection to a list of items. */
export type FileConnectionDistinctArgs = {
	field?: Maybe<FileDistinctEnum>;
};

/** A connection to a list of items. */
export type FileConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	field?: Maybe<FileGroupEnum>;
};

export type FileConnectionAbsolutePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionAccessTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionAtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileConnectionAtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionBaseQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionBirthtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileConnectionBirthtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionBirthTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionChangeTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionCtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileConnectionCtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionDevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileConnectionDirQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionExtensionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionExtQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionGidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileConnectionIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionInoQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileConnectionInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionInternalDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionInternalInputObject_2 = {
	contentDigest?: Maybe<FileConnectionInternalContentDigestQueryString_2>;
	type?: Maybe<FileConnectionInternalTypeQueryString_2>;
	mediaType?: Maybe<FileConnectionInternalMediaTypeQueryString_2>;
	description?: Maybe<FileConnectionInternalDescriptionQueryString_2>;
	owner?: Maybe<FileConnectionInternalOwnerQueryString_2>;
};

export type FileConnectionInternalMediaTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionModeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileConnectionModifiedTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionMtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileConnectionMtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionNlinkQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileConnectionPrettySizeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionRdevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileConnectionRelativeDirectoryQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionRelativePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionRootQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionSizeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileConnectionSort = {
	fields: Array<Maybe<FileConnectionSortByFieldsEnum>>;
	order?: Maybe<Array<Maybe<FileConnectionSortOrderValues>>>;
};

export enum FileConnectionSortByFieldsEnum {
	Id = 'id',
	Children = 'children',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___MediaType = 'internal___mediaType',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
	SourceInstanceName = 'sourceInstanceName',
	AbsolutePath = 'absolutePath',
	RelativePath = 'relativePath',
	Extension = 'extension',
	Size = 'size',
	PrettySize = 'prettySize',
	ModifiedTime = 'modifiedTime',
	AccessTime = 'accessTime',
	ChangeTime = 'changeTime',
	BirthTime = 'birthTime',
	Root = 'root',
	Dir = 'dir',
	Base = 'base',
	Ext = 'ext',
	Name = 'name',
	RelativeDirectory = 'relativeDirectory',
	Dev = 'dev',
	Mode = 'mode',
	Nlink = 'nlink',
	Uid = 'uid',
	Gid = 'gid',
	Rdev = 'rdev',
	Ino = 'ino',
	AtimeMs = 'atimeMs',
	MtimeMs = 'mtimeMs',
	CtimeMs = 'ctimeMs',
	BirthtimeMs = 'birthtimeMs',
	Atime = 'atime',
	Mtime = 'mtime',
	Ctime = 'ctime',
	Birthtime = 'birthtime',
	PublicUrl = 'publicURL',
}

export enum FileConnectionSortOrderValues {
	Asc = 'ASC',
	Desc = 'DESC',
}

export type FileConnectionSourceInstanceNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileConnectionUidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileCtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileCtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileDevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileDirQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum FileDistinctEnum {
	Id = 'id',
	Children = 'children',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___MediaType = 'internal___mediaType',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
	SourceInstanceName = 'sourceInstanceName',
	AbsolutePath = 'absolutePath',
	RelativePath = 'relativePath',
	Extension = 'extension',
	Size = 'size',
	PrettySize = 'prettySize',
	ModifiedTime = 'modifiedTime',
	AccessTime = 'accessTime',
	ChangeTime = 'changeTime',
	BirthTime = 'birthTime',
	Root = 'root',
	Dir = 'dir',
	Base = 'base',
	Ext = 'ext',
	Name = 'name',
	RelativeDirectory = 'relativeDirectory',
	Dev = 'dev',
	Mode = 'mode',
	Nlink = 'nlink',
	Uid = 'uid',
	Gid = 'gid',
	Rdev = 'rdev',
	Ino = 'ino',
	AtimeMs = 'atimeMs',
	MtimeMs = 'mtimeMs',
	CtimeMs = 'ctimeMs',
	BirthtimeMs = 'birthtimeMs',
	Atime = 'atime',
	Mtime = 'mtime',
	Ctime = 'ctime',
	Birthtime = 'birthtime',
}

/** An edge in a connection. */
export type FileEdge = {
	/** The item at the end of the edge */
	node?: Maybe<File>;
	/** The next edge in the connection */
	next?: Maybe<File>;
	/** The previous edge in the connection */
	previous?: Maybe<File>;
};

export type FileExtensionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileExtQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileGidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

/** A connection to a list of items. */
export type FileGroupConnectionConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<FileGroupConnectionEdge>>>;
	field?: Maybe<Scalars['String']>;
	fieldValue?: Maybe<Scalars['String']>;
	totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type FileGroupConnectionEdge = {
	/** The item at the end of the edge */
	node?: Maybe<File>;
	/** The next edge in the connection */
	next?: Maybe<File>;
	/** The previous edge in the connection */
	previous?: Maybe<File>;
};

export enum FileGroupEnum {
	Id = 'id',
	Children = 'children',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___MediaType = 'internal___mediaType',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
	SourceInstanceName = 'sourceInstanceName',
	AbsolutePath = 'absolutePath',
	RelativePath = 'relativePath',
	Extension = 'extension',
	Size = 'size',
	PrettySize = 'prettySize',
	ModifiedTime = 'modifiedTime',
	AccessTime = 'accessTime',
	ChangeTime = 'changeTime',
	BirthTime = 'birthTime',
	Root = 'root',
	Dir = 'dir',
	Base = 'base',
	Ext = 'ext',
	Name = 'name',
	RelativeDirectory = 'relativeDirectory',
	Dev = 'dev',
	Mode = 'mode',
	Nlink = 'nlink',
	Uid = 'uid',
	Gid = 'gid',
	Rdev = 'rdev',
	Ino = 'ino',
	AtimeMs = 'atimeMs',
	MtimeMs = 'mtimeMs',
	CtimeMs = 'ctimeMs',
	BirthtimeMs = 'birthtimeMs',
	Atime = 'atime',
	Mtime = 'mtime',
	Ctime = 'ctime',
	Birthtime = 'birthtime',
}

export type FileIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileInoQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileInternalDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileInternalInputObject_2 = {
	contentDigest?: Maybe<FileInternalContentDigestQueryString_2>;
	type?: Maybe<FileInternalTypeQueryString_2>;
	mediaType?: Maybe<FileInternalMediaTypeQueryString_2>;
	description?: Maybe<FileInternalDescriptionQueryString_2>;
	owner?: Maybe<FileInternalOwnerQueryString_2>;
};

export type FileInternalMediaTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileModeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileModifiedTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileMtimeMsQueryFloat_2 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FileMtimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileNlinkQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FilePrettySizeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileRdevQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileRelativeDirectoryQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileRelativePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileRootQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileSizeQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FileSourceInstanceNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FileUidQueryInteger_2 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

/** Filter connection on its fields */
export type FilterDirectory = {
	id?: Maybe<DirectoryConnectionIdQueryString_2>;
	internal?: Maybe<DirectoryConnectionInternalInputObject_2>;
	sourceInstanceName?: Maybe<
		DirectoryConnectionSourceInstanceNameQueryString_2
	>;
	absolutePath?: Maybe<DirectoryConnectionAbsolutePathQueryString_2>;
	relativePath?: Maybe<DirectoryConnectionRelativePathQueryString_2>;
	extension?: Maybe<DirectoryConnectionExtensionQueryString_2>;
	size?: Maybe<DirectoryConnectionSizeQueryInteger_2>;
	prettySize?: Maybe<DirectoryConnectionPrettySizeQueryString_2>;
	modifiedTime?: Maybe<DirectoryConnectionModifiedTimeQueryString_2>;
	accessTime?: Maybe<DirectoryConnectionAccessTimeQueryString_2>;
	changeTime?: Maybe<DirectoryConnectionChangeTimeQueryString_2>;
	birthTime?: Maybe<DirectoryConnectionBirthTimeQueryString_2>;
	root?: Maybe<DirectoryConnectionRootQueryString_2>;
	dir?: Maybe<DirectoryConnectionDirQueryString_2>;
	base?: Maybe<DirectoryConnectionBaseQueryString_2>;
	ext?: Maybe<DirectoryConnectionExtQueryString_2>;
	name?: Maybe<DirectoryConnectionNameQueryString_2>;
	relativeDirectory?: Maybe<DirectoryConnectionRelativeDirectoryQueryString_2>;
	dev?: Maybe<DirectoryConnectionDevQueryInteger_2>;
	mode?: Maybe<DirectoryConnectionModeQueryInteger_2>;
	nlink?: Maybe<DirectoryConnectionNlinkQueryInteger_2>;
	uid?: Maybe<DirectoryConnectionUidQueryInteger_2>;
	gid?: Maybe<DirectoryConnectionGidQueryInteger_2>;
	rdev?: Maybe<DirectoryConnectionRdevQueryInteger_2>;
	ino?: Maybe<DirectoryConnectionInoQueryFloat_2>;
	atimeMs?: Maybe<DirectoryConnectionAtimeMsQueryFloat_2>;
	mtimeMs?: Maybe<DirectoryConnectionMtimeMsQueryFloat_2>;
	ctimeMs?: Maybe<DirectoryConnectionCtimeMsQueryFloat_2>;
	birthtimeMs?: Maybe<DirectoryConnectionBirthtimeMsQueryFloat_2>;
	atime?: Maybe<DirectoryConnectionAtimeQueryString_2>;
	mtime?: Maybe<DirectoryConnectionMtimeQueryString_2>;
	ctime?: Maybe<DirectoryConnectionCtimeQueryString_2>;
	birthtime?: Maybe<DirectoryConnectionBirthtimeQueryString_2>;
};

/** Filter connection on its fields */
export type FilterFile = {
	id?: Maybe<FileConnectionIdQueryString_2>;
	internal?: Maybe<FileConnectionInternalInputObject_2>;
	sourceInstanceName?: Maybe<FileConnectionSourceInstanceNameQueryString_2>;
	absolutePath?: Maybe<FileConnectionAbsolutePathQueryString_2>;
	relativePath?: Maybe<FileConnectionRelativePathQueryString_2>;
	extension?: Maybe<FileConnectionExtensionQueryString_2>;
	size?: Maybe<FileConnectionSizeQueryInteger_2>;
	prettySize?: Maybe<FileConnectionPrettySizeQueryString_2>;
	modifiedTime?: Maybe<FileConnectionModifiedTimeQueryString_2>;
	accessTime?: Maybe<FileConnectionAccessTimeQueryString_2>;
	changeTime?: Maybe<FileConnectionChangeTimeQueryString_2>;
	birthTime?: Maybe<FileConnectionBirthTimeQueryString_2>;
	root?: Maybe<FileConnectionRootQueryString_2>;
	dir?: Maybe<FileConnectionDirQueryString_2>;
	base?: Maybe<FileConnectionBaseQueryString_2>;
	ext?: Maybe<FileConnectionExtQueryString_2>;
	name?: Maybe<FileConnectionNameQueryString_2>;
	relativeDirectory?: Maybe<FileConnectionRelativeDirectoryQueryString_2>;
	dev?: Maybe<FileConnectionDevQueryInteger_2>;
	mode?: Maybe<FileConnectionModeQueryInteger_2>;
	nlink?: Maybe<FileConnectionNlinkQueryInteger_2>;
	uid?: Maybe<FileConnectionUidQueryInteger_2>;
	gid?: Maybe<FileConnectionGidQueryInteger_2>;
	rdev?: Maybe<FileConnectionRdevQueryInteger_2>;
	ino?: Maybe<FileConnectionInoQueryFloat_2>;
	atimeMs?: Maybe<FileConnectionAtimeMsQueryFloat_2>;
	mtimeMs?: Maybe<FileConnectionMtimeMsQueryFloat_2>;
	ctimeMs?: Maybe<FileConnectionCtimeMsQueryFloat_2>;
	birthtimeMs?: Maybe<FileConnectionBirthtimeMsQueryFloat_2>;
	atime?: Maybe<FileConnectionAtimeQueryString_2>;
	mtime?: Maybe<FileConnectionMtimeQueryString_2>;
	ctime?: Maybe<FileConnectionCtimeQueryString_2>;
	birthtime?: Maybe<FileConnectionBirthtimeQueryString_2>;
	publicURL?: Maybe<PublicUrlQueryString_4>;
};

/** Filter connection on its fields */
export type FilterImageSharp = {
	id?: Maybe<ImageSharpConnectionIdQueryString_2>;
	internal?: Maybe<ImageSharpConnectionInternalInputObject_2>;
	fixed?: Maybe<FixedTypeName_4>;
	resolutions?: Maybe<ResolutionsTypeName_4>;
	fluid?: Maybe<FluidTypeName_4>;
	sizes?: Maybe<SizesTypeName_4>;
	original?: Maybe<OriginalTypeName_4>;
	resize?: Maybe<ResizeTypeName_4>;
};

/** Filter connection on its fields */
export type FilterSitePage = {
	jsonName?: Maybe<SitePageConnectionJsonNameQueryString>;
	internalComponentName?: Maybe<
		SitePageConnectionInternalComponentNameQueryString
	>;
	path?: Maybe<SitePageConnectionPathQueryString_2>;
	component?: Maybe<SitePageConnectionComponentQueryString>;
	componentChunkName?: Maybe<SitePageConnectionComponentChunkNameQueryString>;
	pluginCreator?: Maybe<SitePageConnectionPluginCreatorInputObject>;
	pluginCreatorId?: Maybe<SitePageConnectionPluginCreatorIdQueryString_2>;
	componentPath?: Maybe<SitePageConnectionComponentPathQueryString>;
	id?: Maybe<SitePageConnectionIdQueryString_2>;
	internal?: Maybe<SitePageConnectionInternalInputObject_2>;
};

/** Filter connection on its fields */
export type FilterSitePlugin = {
	resolve?: Maybe<SitePluginConnectionResolveQueryString_2>;
	id?: Maybe<SitePluginConnectionIdQueryString_2>;
	name?: Maybe<SitePluginConnectionNameQueryString_2>;
	version?: Maybe<SitePluginConnectionVersionQueryString_2>;
	pluginOptions?: Maybe<SitePluginConnectionPluginOptionsInputObject_2>;
	nodeAPIs?: Maybe<SitePluginConnectionNodeApIsQueryList_2>;
	browserAPIs?: Maybe<SitePluginConnectionBrowserApIsQueryList_2>;
	ssrAPIs?: Maybe<SitePluginConnectionSsrApIsQueryList_2>;
	pluginFilepath?: Maybe<SitePluginConnectionPluginFilepathQueryString_2>;
	packageJson?: Maybe<SitePluginConnectionPackageJsonInputObject_2>;
	internal?: Maybe<SitePluginConnectionInternalInputObject_2>;
};

export type FixedAspectRatioQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FixedAspectRatioQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FixedBase64QueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedBase64QueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedHeightQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FixedHeightQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FixedOriginalNameQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedOriginalNameQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcSetQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcSetQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcSetWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcSetWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedSrcWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedTracedSvgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedTracedSvgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FixedTypeName_3 = {
	base64?: Maybe<FixedBase64QueryString_3>;
	tracedSVG?: Maybe<FixedTracedSvgQueryString_3>;
	aspectRatio?: Maybe<FixedAspectRatioQueryFloat_3>;
	width?: Maybe<FixedWidthQueryFloat_3>;
	height?: Maybe<FixedHeightQueryFloat_3>;
	src?: Maybe<FixedSrcQueryString_3>;
	srcSet?: Maybe<FixedSrcSetQueryString_3>;
	srcWebp?: Maybe<FixedSrcWebpQueryString_3>;
	srcSetWebp?: Maybe<FixedSrcSetWebpQueryString_3>;
	originalName?: Maybe<FixedOriginalNameQueryString_3>;
};

export type FixedTypeName_4 = {
	base64?: Maybe<FixedBase64QueryString_4>;
	tracedSVG?: Maybe<FixedTracedSvgQueryString_4>;
	aspectRatio?: Maybe<FixedAspectRatioQueryFloat_4>;
	width?: Maybe<FixedWidthQueryFloat_4>;
	height?: Maybe<FixedHeightQueryFloat_4>;
	src?: Maybe<FixedSrcQueryString_4>;
	srcSet?: Maybe<FixedSrcSetQueryString_4>;
	srcWebp?: Maybe<FixedSrcWebpQueryString_4>;
	srcSetWebp?: Maybe<FixedSrcSetWebpQueryString_4>;
	originalName?: Maybe<FixedOriginalNameQueryString_4>;
};

export type FixedWidthQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FixedWidthQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FluidAspectRatioQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FluidAspectRatioQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type FluidBase64QueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidBase64QueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidOriginalImgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidOriginalImgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidOriginalNameQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidOriginalNameQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidPresentationHeightQueryInt_3 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FluidPresentationHeightQueryInt_4 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FluidPresentationWidthQueryInt_3 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FluidPresentationWidthQueryInt_4 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type FluidSizesQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSizesQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcSetQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcSetQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcSetWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcSetWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidSrcWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidTracedSvgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidTracedSvgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FluidTypeName_3 = {
	base64?: Maybe<FluidBase64QueryString_3>;
	tracedSVG?: Maybe<FluidTracedSvgQueryString_3>;
	aspectRatio?: Maybe<FluidAspectRatioQueryFloat_3>;
	src?: Maybe<FluidSrcQueryString_3>;
	srcSet?: Maybe<FluidSrcSetQueryString_3>;
	srcWebp?: Maybe<FluidSrcWebpQueryString_3>;
	srcSetWebp?: Maybe<FluidSrcSetWebpQueryString_3>;
	sizes?: Maybe<FluidSizesQueryString_3>;
	originalImg?: Maybe<FluidOriginalImgQueryString_3>;
	originalName?: Maybe<FluidOriginalNameQueryString_3>;
	presentationWidth?: Maybe<FluidPresentationWidthQueryInt_3>;
	presentationHeight?: Maybe<FluidPresentationHeightQueryInt_3>;
};

export type FluidTypeName_4 = {
	base64?: Maybe<FluidBase64QueryString_4>;
	tracedSVG?: Maybe<FluidTracedSvgQueryString_4>;
	aspectRatio?: Maybe<FluidAspectRatioQueryFloat_4>;
	src?: Maybe<FluidSrcQueryString_4>;
	srcSet?: Maybe<FluidSrcSetQueryString_4>;
	srcWebp?: Maybe<FluidSrcWebpQueryString_4>;
	srcSetWebp?: Maybe<FluidSrcSetWebpQueryString_4>;
	sizes?: Maybe<FluidSizesQueryString_4>;
	originalImg?: Maybe<FluidOriginalImgQueryString_4>;
	originalName?: Maybe<FluidOriginalNameQueryString_4>;
	presentationWidth?: Maybe<FluidPresentationWidthQueryInt_4>;
	presentationHeight?: Maybe<FluidPresentationHeightQueryInt_4>;
};

export enum ImageCropFocus {
	Center = 'CENTER',
	North = 'NORTH',
	Northeast = 'NORTHEAST',
	East = 'EAST',
	Southeast = 'SOUTHEAST',
	South = 'SOUTH',
	Southwest = 'SOUTHWEST',
	West = 'WEST',
	Northwest = 'NORTHWEST',
	Entropy = 'ENTROPY',
	Attention = 'ATTENTION',
}

export enum ImageFormat {
	No_Change = 'NO_CHANGE',
	Jpg = 'JPG',
	Png = 'PNG',
	Webp = 'WEBP',
}

/** Node of type ImageSharp */
export type ImageSharp = Node & {
	/** The id of this node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
	internal?: Maybe<Internal_11>;
	fixed?: Maybe<ImageSharpFixed>;
	resolutions?: Maybe<ImageSharpResolutions>;
	fluid?: Maybe<ImageSharpFluid>;
	sizes?: Maybe<ImageSharpSizes>;
	original?: Maybe<ImageSharpOriginal>;
	resize?: Maybe<ImageSharpResize>;
};

/** Node of type ImageSharp */
export type ImageSharpFixedArgs = {
	width?: Maybe<Scalars['Int']>;
	height?: Maybe<Scalars['Int']>;
	base64Width?: Maybe<Scalars['Int']>;
	jpegProgressive: Scalars['Boolean'];
	pngCompressionSpeed: Scalars['Int'];
	grayscale: Scalars['Boolean'];
	duotone?: Maybe<DuotoneGradient>;
	traceSVG?: Maybe<Potrace>;
	quality?: Maybe<Scalars['Int']>;
	toFormat?: Maybe<ImageFormat>;
	toFormatBase64?: Maybe<ImageFormat>;
	cropFocus?: Maybe<ImageCropFocus>;
	rotate: Scalars['Int'];
};

/** Node of type ImageSharp */
export type ImageSharpResolutionsArgs = {
	width?: Maybe<Scalars['Int']>;
	height?: Maybe<Scalars['Int']>;
	base64Width?: Maybe<Scalars['Int']>;
	jpegProgressive: Scalars['Boolean'];
	pngCompressionSpeed: Scalars['Int'];
	grayscale: Scalars['Boolean'];
	duotone?: Maybe<DuotoneGradient>;
	traceSVG?: Maybe<Potrace>;
	quality?: Maybe<Scalars['Int']>;
	toFormat?: Maybe<ImageFormat>;
	toFormatBase64?: Maybe<ImageFormat>;
	cropFocus?: Maybe<ImageCropFocus>;
	rotate: Scalars['Int'];
};

/** Node of type ImageSharp */
export type ImageSharpFluidArgs = {
	maxWidth?: Maybe<Scalars['Int']>;
	maxHeight?: Maybe<Scalars['Int']>;
	base64Width?: Maybe<Scalars['Int']>;
	grayscale: Scalars['Boolean'];
	jpegProgressive: Scalars['Boolean'];
	pngCompressionSpeed: Scalars['Int'];
	duotone?: Maybe<DuotoneGradient>;
	traceSVG?: Maybe<Potrace>;
	quality?: Maybe<Scalars['Int']>;
	toFormat?: Maybe<ImageFormat>;
	toFormatBase64?: Maybe<ImageFormat>;
	cropFocus?: Maybe<ImageCropFocus>;
	rotate: Scalars['Int'];
	sizes: Scalars['String'];
	srcSetBreakpoints: Array<Maybe<Scalars['Int']>>;
};

/** Node of type ImageSharp */
export type ImageSharpSizesArgs = {
	maxWidth?: Maybe<Scalars['Int']>;
	maxHeight?: Maybe<Scalars['Int']>;
	base64Width?: Maybe<Scalars['Int']>;
	grayscale: Scalars['Boolean'];
	jpegProgressive: Scalars['Boolean'];
	pngCompressionSpeed: Scalars['Int'];
	duotone?: Maybe<DuotoneGradient>;
	traceSVG?: Maybe<Potrace>;
	quality?: Maybe<Scalars['Int']>;
	toFormat?: Maybe<ImageFormat>;
	toFormatBase64?: Maybe<ImageFormat>;
	cropFocus?: Maybe<ImageCropFocus>;
	rotate: Scalars['Int'];
	sizes: Scalars['String'];
	srcSetBreakpoints: Array<Maybe<Scalars['Int']>>;
};

/** Node of type ImageSharp */
export type ImageSharpResizeArgs = {
	width?: Maybe<Scalars['Int']>;
	height?: Maybe<Scalars['Int']>;
	quality?: Maybe<Scalars['Int']>;
	jpegProgressive: Scalars['Boolean'];
	pngCompressionLevel: Scalars['Int'];
	pngCompressionSpeed: Scalars['Int'];
	grayscale: Scalars['Boolean'];
	duotone?: Maybe<DuotoneGradient>;
	base64: Scalars['Boolean'];
	traceSVG?: Maybe<Potrace>;
	toFormat?: Maybe<ImageFormat>;
	cropFocus?: Maybe<ImageCropFocus>;
	rotate: Scalars['Int'];
};

/** A connection to a list of items. */
export type ImageSharpConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<ImageSharpEdge>>>;
	totalCount?: Maybe<Scalars['Int']>;
	distinct?: Maybe<Array<Maybe<Scalars['String']>>>;
	group?: Maybe<Array<Maybe<ImageSharpGroupConnectionConnection>>>;
};

/** A connection to a list of items. */
export type ImageSharpConnectionDistinctArgs = {
	field?: Maybe<ImageSharpDistinctEnum>;
};

/** A connection to a list of items. */
export type ImageSharpConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	field?: Maybe<ImageSharpGroupEnum>;
};

export type ImageSharpConnectionIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpConnectionInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpConnectionInternalInputObject_2 = {
	contentDigest?: Maybe<ImageSharpConnectionInternalContentDigestQueryString_2>;
	type?: Maybe<ImageSharpConnectionInternalTypeQueryString_2>;
	owner?: Maybe<ImageSharpConnectionInternalOwnerQueryString_2>;
};

export type ImageSharpConnectionInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpConnectionInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpConnectionSort = {
	fields: Array<Maybe<ImageSharpConnectionSortByFieldsEnum>>;
	order?: Maybe<Array<Maybe<ImageSharpConnectionSortOrderValues>>>;
};

export enum ImageSharpConnectionSortByFieldsEnum {
	Id = 'id',
	Parent = 'parent',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Owner = 'internal___owner',
	Fixed___Base64 = 'fixed___base64',
	Fixed___TracedSvg = 'fixed___tracedSVG',
	Fixed___AspectRatio = 'fixed___aspectRatio',
	Fixed___Width = 'fixed___width',
	Fixed___Height = 'fixed___height',
	Fixed___Src = 'fixed___src',
	Fixed___SrcSet = 'fixed___srcSet',
	Fixed___SrcWebp = 'fixed___srcWebp',
	Fixed___SrcSetWebp = 'fixed___srcSetWebp',
	Fixed___OriginalName = 'fixed___originalName',
	Resolutions___Base64 = 'resolutions___base64',
	Resolutions___TracedSvg = 'resolutions___tracedSVG',
	Resolutions___AspectRatio = 'resolutions___aspectRatio',
	Resolutions___Width = 'resolutions___width',
	Resolutions___Height = 'resolutions___height',
	Resolutions___Src = 'resolutions___src',
	Resolutions___SrcSet = 'resolutions___srcSet',
	Resolutions___SrcWebp = 'resolutions___srcWebp',
	Resolutions___SrcSetWebp = 'resolutions___srcSetWebp',
	Resolutions___OriginalName = 'resolutions___originalName',
	Fluid___Base64 = 'fluid___base64',
	Fluid___TracedSvg = 'fluid___tracedSVG',
	Fluid___AspectRatio = 'fluid___aspectRatio',
	Fluid___Src = 'fluid___src',
	Fluid___SrcSet = 'fluid___srcSet',
	Fluid___SrcWebp = 'fluid___srcWebp',
	Fluid___SrcSetWebp = 'fluid___srcSetWebp',
	Fluid___Sizes = 'fluid___sizes',
	Fluid___OriginalImg = 'fluid___originalImg',
	Fluid___OriginalName = 'fluid___originalName',
	Fluid___PresentationWidth = 'fluid___presentationWidth',
	Fluid___PresentationHeight = 'fluid___presentationHeight',
	Sizes___Base64 = 'sizes___base64',
	Sizes___TracedSvg = 'sizes___tracedSVG',
	Sizes___AspectRatio = 'sizes___aspectRatio',
	Sizes___Src = 'sizes___src',
	Sizes___SrcSet = 'sizes___srcSet',
	Sizes___SrcWebp = 'sizes___srcWebp',
	Sizes___SrcSetWebp = 'sizes___srcSetWebp',
	Sizes___Sizes = 'sizes___sizes',
	Sizes___OriginalImg = 'sizes___originalImg',
	Sizes___OriginalName = 'sizes___originalName',
	Sizes___PresentationWidth = 'sizes___presentationWidth',
	Sizes___PresentationHeight = 'sizes___presentationHeight',
	Original___Width = 'original___width',
	Original___Height = 'original___height',
	Original___Src = 'original___src',
	Resize___Src = 'resize___src',
	Resize___TracedSvg = 'resize___tracedSVG',
	Resize___Width = 'resize___width',
	Resize___Height = 'resize___height',
	Resize___AspectRatio = 'resize___aspectRatio',
	Resize___OriginalName = 'resize___originalName',
}

export enum ImageSharpConnectionSortOrderValues {
	Asc = 'ASC',
	Desc = 'DESC',
}

export enum ImageSharpDistinctEnum {
	Id = 'id',
	Parent = 'parent',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Owner = 'internal___owner',
}

/** An edge in a connection. */
export type ImageSharpEdge = {
	/** The item at the end of the edge */
	node?: Maybe<ImageSharp>;
	/** The next edge in the connection */
	next?: Maybe<ImageSharp>;
	/** The previous edge in the connection */
	previous?: Maybe<ImageSharp>;
};

export type ImageSharpFixed = {
	base64?: Maybe<Scalars['String']>;
	tracedSVG?: Maybe<Scalars['String']>;
	aspectRatio?: Maybe<Scalars['Float']>;
	width?: Maybe<Scalars['Float']>;
	height?: Maybe<Scalars['Float']>;
	src?: Maybe<Scalars['String']>;
	srcSet?: Maybe<Scalars['String']>;
	srcWebp?: Maybe<Scalars['String']>;
	srcSetWebp?: Maybe<Scalars['String']>;
	originalName?: Maybe<Scalars['String']>;
};

export type ImageSharpFluid = {
	base64?: Maybe<Scalars['String']>;
	tracedSVG?: Maybe<Scalars['String']>;
	aspectRatio?: Maybe<Scalars['Float']>;
	src?: Maybe<Scalars['String']>;
	srcSet?: Maybe<Scalars['String']>;
	srcWebp?: Maybe<Scalars['String']>;
	srcSetWebp?: Maybe<Scalars['String']>;
	sizes?: Maybe<Scalars['String']>;
	originalImg?: Maybe<Scalars['String']>;
	originalName?: Maybe<Scalars['String']>;
	presentationWidth?: Maybe<Scalars['Int']>;
	presentationHeight?: Maybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type ImageSharpGroupConnectionConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<ImageSharpGroupConnectionEdge>>>;
	field?: Maybe<Scalars['String']>;
	fieldValue?: Maybe<Scalars['String']>;
	totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type ImageSharpGroupConnectionEdge = {
	/** The item at the end of the edge */
	node?: Maybe<ImageSharp>;
	/** The next edge in the connection */
	next?: Maybe<ImageSharp>;
	/** The previous edge in the connection */
	previous?: Maybe<ImageSharp>;
};

export enum ImageSharpGroupEnum {
	Id = 'id',
	Parent = 'parent',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Owner = 'internal___owner',
}

export type ImageSharpIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpInternalInputObject_2 = {
	contentDigest?: Maybe<ImageSharpInternalContentDigestQueryString_2>;
	type?: Maybe<ImageSharpInternalTypeQueryString_2>;
	owner?: Maybe<ImageSharpInternalOwnerQueryString_2>;
};

export type ImageSharpInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ImageSharpOriginal = {
	width?: Maybe<Scalars['Float']>;
	height?: Maybe<Scalars['Float']>;
	src?: Maybe<Scalars['String']>;
};

export type ImageSharpResize = {
	src?: Maybe<Scalars['String']>;
	tracedSVG?: Maybe<Scalars['String']>;
	width?: Maybe<Scalars['Int']>;
	height?: Maybe<Scalars['Int']>;
	aspectRatio?: Maybe<Scalars['Float']>;
	originalName?: Maybe<Scalars['String']>;
};

export type ImageSharpResolutions = {
	base64?: Maybe<Scalars['String']>;
	tracedSVG?: Maybe<Scalars['String']>;
	aspectRatio?: Maybe<Scalars['Float']>;
	width?: Maybe<Scalars['Float']>;
	height?: Maybe<Scalars['Float']>;
	src?: Maybe<Scalars['String']>;
	srcSet?: Maybe<Scalars['String']>;
	srcWebp?: Maybe<Scalars['String']>;
	srcSetWebp?: Maybe<Scalars['String']>;
	originalName?: Maybe<Scalars['String']>;
};

export type ImageSharpSizes = {
	base64?: Maybe<Scalars['String']>;
	tracedSVG?: Maybe<Scalars['String']>;
	aspectRatio?: Maybe<Scalars['Float']>;
	src?: Maybe<Scalars['String']>;
	srcSet?: Maybe<Scalars['String']>;
	srcWebp?: Maybe<Scalars['String']>;
	srcSetWebp?: Maybe<Scalars['String']>;
	sizes?: Maybe<Scalars['String']>;
	originalImg?: Maybe<Scalars['String']>;
	originalName?: Maybe<Scalars['String']>;
	presentationWidth?: Maybe<Scalars['Int']>;
	presentationHeight?: Maybe<Scalars['Int']>;
};

export type Internal_10 = {
	contentDigest?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	mediaType?: Maybe<Scalars['String']>;
	description?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
};

export type Internal_11 = {
	contentDigest?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
};

export type Internal_12 = {
	contentDigest?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
};

export type Internal_7 = {
	type?: Maybe<Scalars['String']>;
	contentDigest?: Maybe<Scalars['String']>;
	description?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
};

export type Internal_8 = {
	contentDigest?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
};

export type Internal_9 = {
	contentDigest?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	description?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
};

/** An object with an id, parent, and children */
export type Node = {
	/** The id of the node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
};

export type OriginalHeightQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type OriginalHeightQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type OriginalSrcQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type OriginalSrcQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type OriginalTypeName_3 = {
	width?: Maybe<OriginalWidthQueryFloat_3>;
	height?: Maybe<OriginalHeightQueryFloat_3>;
	src?: Maybe<OriginalSrcQueryString_3>;
};

export type OriginalTypeName_4 = {
	width?: Maybe<OriginalWidthQueryFloat_4>;
	height?: Maybe<OriginalHeightQueryFloat_4>;
	src?: Maybe<OriginalSrcQueryString_4>;
};

export type OriginalWidthQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type OriginalWidthQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type PackageJson_2 = {
	name?: Maybe<Scalars['String']>;
	description?: Maybe<Scalars['String']>;
	version?: Maybe<Scalars['String']>;
	main?: Maybe<Scalars['String']>;
	author?: Maybe<Scalars['String']>;
	license?: Maybe<Scalars['String']>;
	dependencies?: Maybe<Array<Maybe<Dependencies_2>>>;
	devDependencies?: Maybe<Array<Maybe<DevDependencies_2>>>;
	peerDependencies?: Maybe<Array<Maybe<PeerDependencies_2>>>;
	keywords?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
	/** When paginating, are there more items? */
	hasNextPage: Scalars['Boolean'];
};

export type PeerDependencies_2 = {
	name?: Maybe<Scalars['String']>;
	version?: Maybe<Scalars['String']>;
};

export type PluginOptions_2 = {
	typeName?: Maybe<Scalars['String']>;
	fieldName?: Maybe<Scalars['String']>;
	url?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	path?: Maybe<Scalars['String']>;
	short_name?: Maybe<Scalars['String']>;
	start_url?: Maybe<Scalars['String']>;
	background_color?: Maybe<Scalars['String']>;
	theme_color?: Maybe<Scalars['String']>;
	display?: Maybe<Scalars['String']>;
	icon?: Maybe<Scalars['String']>;
	pathCheck?: Maybe<Scalars['Boolean']>;
};

export type Potrace = {
	turnPolicy?: Maybe<PotraceTurnPolicy>;
	turdSize?: Maybe<Scalars['Float']>;
	alphaMax?: Maybe<Scalars['Float']>;
	optCurve?: Maybe<Scalars['Boolean']>;
	optTolerance?: Maybe<Scalars['Float']>;
	threshold?: Maybe<Scalars['Int']>;
	blackOnWhite?: Maybe<Scalars['Boolean']>;
	color?: Maybe<Scalars['String']>;
	background?: Maybe<Scalars['String']>;
};

export enum PotraceTurnPolicy {
	Turnpolicy_Black = 'TURNPOLICY_BLACK',
	Turnpolicy_White = 'TURNPOLICY_WHITE',
	Turnpolicy_Left = 'TURNPOLICY_LEFT',
	Turnpolicy_Right = 'TURNPOLICY_RIGHT',
	Turnpolicy_Minority = 'TURNPOLICY_MINORITY',
	Turnpolicy_Majority = 'TURNPOLICY_MAJORITY',
}

export type PublicUrlQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type PublicUrlQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Query = {
	/** Connection to all SitePage nodes */
	allSitePage?: Maybe<SitePageConnection>;
	/** Connection to all SitePlugin nodes */
	allSitePlugin?: Maybe<SitePluginConnection>;
	/** Connection to all Directory nodes */
	allDirectory?: Maybe<DirectoryConnection>;
	/** Connection to all File nodes */
	allFile?: Maybe<FileConnection>;
	/** Connection to all ImageSharp nodes */
	allImageSharp?: Maybe<ImageSharpConnection>;
	sitePage?: Maybe<SitePage>;
	sitePlugin?: Maybe<SitePlugin>;
	site?: Maybe<Site>;
	directory?: Maybe<Directory>;
	file?: Maybe<File>;
	imageSharp?: Maybe<ImageSharp>;
	ever?: Maybe<Ever>;
};

export type QueryAllSitePageArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<SitePageConnectionSort>;
	filter?: Maybe<FilterSitePage>;
};

export type QueryAllSitePluginArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<SitePluginConnectionSort>;
	filter?: Maybe<FilterSitePlugin>;
};

export type QueryAllDirectoryArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<DirectoryConnectionSort>;
	filter?: Maybe<FilterDirectory>;
};

export type QueryAllFileArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<FileConnectionSort>;
	filter?: Maybe<FilterFile>;
};

export type QueryAllImageSharpArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ImageSharpConnectionSort>;
	filter?: Maybe<FilterImageSharp>;
};

export type QuerySitePageArgs = {
	jsonName?: Maybe<SitePageJsonNameQueryString>;
	internalComponentName?: Maybe<SitePageInternalComponentNameQueryString>;
	path?: Maybe<SitePagePathQueryString_2>;
	component?: Maybe<SitePageComponentQueryString>;
	componentChunkName?: Maybe<SitePageComponentChunkNameQueryString>;
	pluginCreator?: Maybe<SitePagePluginCreatorInputObject>;
	pluginCreatorId?: Maybe<SitePagePluginCreatorIdQueryString_2>;
	componentPath?: Maybe<SitePageComponentPathQueryString>;
	id?: Maybe<SitePageIdQueryString_2>;
	internal?: Maybe<SitePageInternalInputObject_2>;
};

export type QuerySitePluginArgs = {
	resolve?: Maybe<SitePluginResolveQueryString_2>;
	id?: Maybe<SitePluginIdQueryString_2>;
	name?: Maybe<SitePluginNameQueryString_2>;
	version?: Maybe<SitePluginVersionQueryString_2>;
	pluginOptions?: Maybe<SitePluginPluginOptionsInputObject_2>;
	nodeAPIs?: Maybe<SitePluginNodeApIsQueryList_2>;
	browserAPIs?: Maybe<SitePluginBrowserApIsQueryList_2>;
	ssrAPIs?: Maybe<SitePluginSsrApIsQueryList_2>;
	pluginFilepath?: Maybe<SitePluginPluginFilepathQueryString_2>;
	packageJson?: Maybe<SitePluginPackageJsonInputObject_2>;
	internal?: Maybe<SitePluginInternalInputObject_2>;
};

export type QuerySiteArgs = {
	siteMetadata?: Maybe<SiteSiteMetadataInputObject_2>;
	port?: Maybe<SitePortQueryString_2>;
	host?: Maybe<SiteHostQueryString_2>;
	pathPrefix?: Maybe<SitePathPrefixQueryString_2>;
	polyfill?: Maybe<SitePolyfillQueryBoolean_2>;
	buildTime?: Maybe<SiteBuildTimeQueryString_2>;
	id?: Maybe<SiteIdQueryString_2>;
	internal?: Maybe<SiteInternalInputObject_2>;
};

export type QueryDirectoryArgs = {
	id?: Maybe<DirectoryIdQueryString_2>;
	internal?: Maybe<DirectoryInternalInputObject_2>;
	sourceInstanceName?: Maybe<DirectorySourceInstanceNameQueryString_2>;
	absolutePath?: Maybe<DirectoryAbsolutePathQueryString_2>;
	relativePath?: Maybe<DirectoryRelativePathQueryString_2>;
	extension?: Maybe<DirectoryExtensionQueryString_2>;
	size?: Maybe<DirectorySizeQueryInteger_2>;
	prettySize?: Maybe<DirectoryPrettySizeQueryString_2>;
	modifiedTime?: Maybe<DirectoryModifiedTimeQueryString_2>;
	accessTime?: Maybe<DirectoryAccessTimeQueryString_2>;
	changeTime?: Maybe<DirectoryChangeTimeQueryString_2>;
	birthTime?: Maybe<DirectoryBirthTimeQueryString_2>;
	root?: Maybe<DirectoryRootQueryString_2>;
	dir?: Maybe<DirectoryDirQueryString_2>;
	base?: Maybe<DirectoryBaseQueryString_2>;
	ext?: Maybe<DirectoryExtQueryString_2>;
	name?: Maybe<DirectoryNameQueryString_2>;
	relativeDirectory?: Maybe<DirectoryRelativeDirectoryQueryString_2>;
	dev?: Maybe<DirectoryDevQueryInteger_2>;
	mode?: Maybe<DirectoryModeQueryInteger_2>;
	nlink?: Maybe<DirectoryNlinkQueryInteger_2>;
	uid?: Maybe<DirectoryUidQueryInteger_2>;
	gid?: Maybe<DirectoryGidQueryInteger_2>;
	rdev?: Maybe<DirectoryRdevQueryInteger_2>;
	ino?: Maybe<DirectoryInoQueryFloat_2>;
	atimeMs?: Maybe<DirectoryAtimeMsQueryFloat_2>;
	mtimeMs?: Maybe<DirectoryMtimeMsQueryFloat_2>;
	ctimeMs?: Maybe<DirectoryCtimeMsQueryFloat_2>;
	birthtimeMs?: Maybe<DirectoryBirthtimeMsQueryFloat_2>;
	atime?: Maybe<DirectoryAtimeQueryString_2>;
	mtime?: Maybe<DirectoryMtimeQueryString_2>;
	ctime?: Maybe<DirectoryCtimeQueryString_2>;
	birthtime?: Maybe<DirectoryBirthtimeQueryString_2>;
};

export type QueryFileArgs = {
	id?: Maybe<FileIdQueryString_2>;
	internal?: Maybe<FileInternalInputObject_2>;
	sourceInstanceName?: Maybe<FileSourceInstanceNameQueryString_2>;
	absolutePath?: Maybe<FileAbsolutePathQueryString_2>;
	relativePath?: Maybe<FileRelativePathQueryString_2>;
	extension?: Maybe<FileExtensionQueryString_2>;
	size?: Maybe<FileSizeQueryInteger_2>;
	prettySize?: Maybe<FilePrettySizeQueryString_2>;
	modifiedTime?: Maybe<FileModifiedTimeQueryString_2>;
	accessTime?: Maybe<FileAccessTimeQueryString_2>;
	changeTime?: Maybe<FileChangeTimeQueryString_2>;
	birthTime?: Maybe<FileBirthTimeQueryString_2>;
	root?: Maybe<FileRootQueryString_2>;
	dir?: Maybe<FileDirQueryString_2>;
	base?: Maybe<FileBaseQueryString_2>;
	ext?: Maybe<FileExtQueryString_2>;
	name?: Maybe<FileNameQueryString_2>;
	relativeDirectory?: Maybe<FileRelativeDirectoryQueryString_2>;
	dev?: Maybe<FileDevQueryInteger_2>;
	mode?: Maybe<FileModeQueryInteger_2>;
	nlink?: Maybe<FileNlinkQueryInteger_2>;
	uid?: Maybe<FileUidQueryInteger_2>;
	gid?: Maybe<FileGidQueryInteger_2>;
	rdev?: Maybe<FileRdevQueryInteger_2>;
	ino?: Maybe<FileInoQueryFloat_2>;
	atimeMs?: Maybe<FileAtimeMsQueryFloat_2>;
	mtimeMs?: Maybe<FileMtimeMsQueryFloat_2>;
	ctimeMs?: Maybe<FileCtimeMsQueryFloat_2>;
	birthtimeMs?: Maybe<FileBirthtimeMsQueryFloat_2>;
	atime?: Maybe<FileAtimeQueryString_2>;
	mtime?: Maybe<FileMtimeQueryString_2>;
	ctime?: Maybe<FileCtimeQueryString_2>;
	birthtime?: Maybe<FileBirthtimeQueryString_2>;
	publicURL?: Maybe<PublicUrlQueryString_3>;
};

export type QueryImageSharpArgs = {
	id?: Maybe<ImageSharpIdQueryString_2>;
	internal?: Maybe<ImageSharpInternalInputObject_2>;
	fixed?: Maybe<FixedTypeName_3>;
	resolutions?: Maybe<ResolutionsTypeName_3>;
	fluid?: Maybe<FluidTypeName_3>;
	sizes?: Maybe<SizesTypeName_3>;
	original?: Maybe<OriginalTypeName_3>;
	resize?: Maybe<ResizeTypeName_3>;
};

export type ResizeAspectRatioQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResizeAspectRatioQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResizeHeightQueryInt_3 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type ResizeHeightQueryInt_4 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type ResizeOriginalNameQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResizeOriginalNameQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResizeSrcQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResizeSrcQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResizeTracedSvgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResizeTracedSvgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResizeTypeName_3 = {
	src?: Maybe<ResizeSrcQueryString_3>;
	tracedSVG?: Maybe<ResizeTracedSvgQueryString_3>;
	width?: Maybe<ResizeWidthQueryInt_3>;
	height?: Maybe<ResizeHeightQueryInt_3>;
	aspectRatio?: Maybe<ResizeAspectRatioQueryFloat_3>;
	originalName?: Maybe<ResizeOriginalNameQueryString_3>;
};

export type ResizeTypeName_4 = {
	src?: Maybe<ResizeSrcQueryString_4>;
	tracedSVG?: Maybe<ResizeTracedSvgQueryString_4>;
	width?: Maybe<ResizeWidthQueryInt_4>;
	height?: Maybe<ResizeHeightQueryInt_4>;
	aspectRatio?: Maybe<ResizeAspectRatioQueryFloat_4>;
	originalName?: Maybe<ResizeOriginalNameQueryString_4>;
};

export type ResizeWidthQueryInt_3 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type ResizeWidthQueryInt_4 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type ResolutionsAspectRatioQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResolutionsAspectRatioQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResolutionsBase64QueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsBase64QueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsHeightQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResolutionsHeightQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResolutionsOriginalNameQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsOriginalNameQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcSetQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcSetQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcSetWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcSetWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsSrcWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsTracedSvgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsTracedSvgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ResolutionsTypeName_3 = {
	base64?: Maybe<ResolutionsBase64QueryString_3>;
	tracedSVG?: Maybe<ResolutionsTracedSvgQueryString_3>;
	aspectRatio?: Maybe<ResolutionsAspectRatioQueryFloat_3>;
	width?: Maybe<ResolutionsWidthQueryFloat_3>;
	height?: Maybe<ResolutionsHeightQueryFloat_3>;
	src?: Maybe<ResolutionsSrcQueryString_3>;
	srcSet?: Maybe<ResolutionsSrcSetQueryString_3>;
	srcWebp?: Maybe<ResolutionsSrcWebpQueryString_3>;
	srcSetWebp?: Maybe<ResolutionsSrcSetWebpQueryString_3>;
	originalName?: Maybe<ResolutionsOriginalNameQueryString_3>;
};

export type ResolutionsTypeName_4 = {
	base64?: Maybe<ResolutionsBase64QueryString_4>;
	tracedSVG?: Maybe<ResolutionsTracedSvgQueryString_4>;
	aspectRatio?: Maybe<ResolutionsAspectRatioQueryFloat_4>;
	width?: Maybe<ResolutionsWidthQueryFloat_4>;
	height?: Maybe<ResolutionsHeightQueryFloat_4>;
	src?: Maybe<ResolutionsSrcQueryString_4>;
	srcSet?: Maybe<ResolutionsSrcSetQueryString_4>;
	srcWebp?: Maybe<ResolutionsSrcWebpQueryString_4>;
	srcSetWebp?: Maybe<ResolutionsSrcSetWebpQueryString_4>;
	originalName?: Maybe<ResolutionsOriginalNameQueryString_4>;
};

export type ResolutionsWidthQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type ResolutionsWidthQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

/** Node of type Site */
export type Site = Node & {
	/** The id of this node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
	siteMetadata?: Maybe<SiteMetadata_2>;
	port?: Maybe<Scalars['Date']>;
	host?: Maybe<Scalars['String']>;
	pathPrefix?: Maybe<Scalars['String']>;
	polyfill?: Maybe<Scalars['Boolean']>;
	buildTime?: Maybe<Scalars['Date']>;
	internal?: Maybe<Internal_12>;
};

/** Node of type Site */
export type SitePortArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

/** Node of type Site */
export type SiteBuildTimeArgs = {
	formatString?: Maybe<Scalars['String']>;
	fromNow?: Maybe<Scalars['Boolean']>;
	difference?: Maybe<Scalars['String']>;
	locale?: Maybe<Scalars['String']>;
};

export type SiteBuildTimeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteHostQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteInternalInputObject_2 = {
	contentDigest?: Maybe<SiteInternalContentDigestQueryString_2>;
	type?: Maybe<SiteInternalTypeQueryString_2>;
	owner?: Maybe<SiteInternalOwnerQueryString_2>;
};

export type SiteInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteMetadata_2 = {
	title?: Maybe<Scalars['String']>;
	description?: Maybe<Scalars['String']>;
	author?: Maybe<Scalars['String']>;
};

/** Node of type SitePage */
export type SitePage = Node & {
	/** The id of this node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
	jsonName?: Maybe<Scalars['String']>;
	internalComponentName?: Maybe<Scalars['String']>;
	path?: Maybe<Scalars['String']>;
	component?: Maybe<Scalars['String']>;
	componentChunkName?: Maybe<Scalars['String']>;
	pluginCreator?: Maybe<SitePlugin>;
	pluginCreatorId?: Maybe<Scalars['String']>;
	componentPath?: Maybe<Scalars['String']>;
	internal?: Maybe<Internal_7>;
};

export type SitePageComponentChunkNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageComponentPathQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageComponentQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** A connection to a list of items. */
export type SitePageConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<SitePageEdge>>>;
	totalCount?: Maybe<Scalars['Int']>;
	distinct?: Maybe<Array<Maybe<Scalars['String']>>>;
	group?: Maybe<Array<Maybe<SitePageGroupConnectionConnection>>>;
};

/** A connection to a list of items. */
export type SitePageConnectionDistinctArgs = {
	field?: Maybe<SitePageDistinctEnum>;
};

/** A connection to a list of items. */
export type SitePageConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	field?: Maybe<SitePageGroupEnum>;
};

export type SitePageConnectionComponentChunkNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionComponentPathQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionComponentQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionInternalComponentNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionInternalDescriptionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionInternalInputObject_2 = {
	type?: Maybe<SitePageConnectionInternalTypeQueryString_2>;
	contentDigest?: Maybe<SitePageConnectionInternalContentDigestQueryString_2>;
	description?: Maybe<SitePageConnectionInternalDescriptionQueryString>;
	owner?: Maybe<SitePageConnectionInternalOwnerQueryString_2>;
};

export type SitePageConnectionInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionJsonNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorBrowserApIsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorIdQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorInputObject = {
	resolve?: Maybe<SitePageConnectionPluginCreatorResolveQueryString>;
	id?: Maybe<SitePageConnectionPluginCreatorIdQueryString>;
	name?: Maybe<SitePageConnectionPluginCreatorNameQueryString>;
	version?: Maybe<SitePageConnectionPluginCreatorVersionQueryString>;
	pluginOptions?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsInputObject
	>;
	nodeAPIs?: Maybe<SitePageConnectionPluginCreatorNodeApIsQueryList>;
	browserAPIs?: Maybe<SitePageConnectionPluginCreatorBrowserApIsQueryList>;
	ssrAPIs?: Maybe<SitePageConnectionPluginCreatorSsrApIsQueryList>;
	pluginFilepath?: Maybe<
		SitePageConnectionPluginCreatorPluginFilepathQueryString
	>;
	packageJson?: Maybe<SitePageConnectionPluginCreatorPackageJsonInputObject>;
	internal?: Maybe<SitePageConnectionPluginCreatorInternalInputObject>;
};

export type SitePageConnectionPluginCreatorInternalContentDigestQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorInternalInputObject = {
	contentDigest?: Maybe<
		SitePageConnectionPluginCreatorInternalContentDigestQueryString
	>;
	type?: Maybe<SitePageConnectionPluginCreatorInternalTypeQueryString>;
	owner?: Maybe<SitePageConnectionPluginCreatorInternalOwnerQueryString>;
};

export type SitePageConnectionPluginCreatorInternalOwnerQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorInternalTypeQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorNodeApIsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonAuthorQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonDependenciesInputObject = {
	name?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDependenciesNameQueryString
	>;
	version?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDependenciesVersionQueryString
	>;
};

export type SitePageConnectionPluginCreatorPackageJsonDependenciesNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonDependenciesQueryList = {
	elemMatch?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDependenciesInputObject
	>;
};

export type SitePageConnectionPluginCreatorPackageJsonDependenciesVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonDescriptionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonDevDependenciesInputObject = {
	name?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDevDependenciesNameQueryString
	>;
	version?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDevDependenciesVersionQueryString
	>;
};

export type SitePageConnectionPluginCreatorPackageJsonDevDependenciesNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonDevDependenciesQueryList = {
	elemMatch?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDevDependenciesInputObject
	>;
};

export type SitePageConnectionPluginCreatorPackageJsonDevDependenciesVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonInputObject = {
	name?: Maybe<SitePageConnectionPluginCreatorPackageJsonNameQueryString>;
	description?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDescriptionQueryString
	>;
	version?: Maybe<SitePageConnectionPluginCreatorPackageJsonVersionQueryString>;
	main?: Maybe<SitePageConnectionPluginCreatorPackageJsonMainQueryString>;
	author?: Maybe<SitePageConnectionPluginCreatorPackageJsonAuthorQueryString>;
	license?: Maybe<SitePageConnectionPluginCreatorPackageJsonLicenseQueryString>;
	dependencies?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDependenciesQueryList
	>;
	devDependencies?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonDevDependenciesQueryList
	>;
	peerDependencies?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonPeerDependenciesQueryList
	>;
	keywords?: Maybe<SitePageConnectionPluginCreatorPackageJsonKeywordsQueryList>;
};

export type SitePageConnectionPluginCreatorPackageJsonKeywordsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonLicenseQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonMainQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonPeerDependenciesInputObject = {
	name?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonPeerDependenciesNameQueryString
	>;
	version?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonPeerDependenciesVersionQueryString
	>;
};

export type SitePageConnectionPluginCreatorPackageJsonPeerDependenciesNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonPeerDependenciesQueryList = {
	elemMatch?: Maybe<
		SitePageConnectionPluginCreatorPackageJsonPeerDependenciesInputObject
	>;
};

export type SitePageConnectionPluginCreatorPackageJsonPeerDependenciesVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPackageJsonVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginFilepathQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsBackgroundColorQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsDisplayQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsFieldNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsIconQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsInputObject = {
	typeName?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsTypeNameQueryString
	>;
	fieldName?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsFieldNameQueryString
	>;
	url?: Maybe<SitePageConnectionPluginCreatorPluginOptionsUrlQueryString>;
	name?: Maybe<SitePageConnectionPluginCreatorPluginOptionsNameQueryString>;
	path?: Maybe<SitePageConnectionPluginCreatorPluginOptionsPathQueryString>;
	short_name?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsShortNameQueryString
	>;
	start_url?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsStartUrlQueryString
	>;
	background_color?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsBackgroundColorQueryString
	>;
	theme_color?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsThemeColorQueryString
	>;
	display?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsDisplayQueryString
	>;
	icon?: Maybe<SitePageConnectionPluginCreatorPluginOptionsIconQueryString>;
	pathCheck?: Maybe<
		SitePageConnectionPluginCreatorPluginOptionsPathCheckQueryBoolean
	>;
};

export type SitePageConnectionPluginCreatorPluginOptionsNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsPathCheckQueryBoolean = {
	eq?: Maybe<Scalars['Boolean']>;
	ne?: Maybe<Scalars['Boolean']>;
	in?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsPathQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsShortNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsStartUrlQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsThemeColorQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsTypeNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorPluginOptionsUrlQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorResolveQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorSsrApIsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionPluginCreatorVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageConnectionSort = {
	fields: Array<Maybe<SitePageConnectionSortByFieldsEnum>>;
	order?: Maybe<Array<Maybe<SitePageConnectionSortOrderValues>>>;
};

export enum SitePageConnectionSortByFieldsEnum {
	JsonName = 'jsonName',
	InternalComponentName = 'internalComponentName',
	Path = 'path',
	Component = 'component',
	ComponentChunkName = 'componentChunkName',
	PluginCreator___Node = 'pluginCreator___NODE',
	PluginCreatorId = 'pluginCreatorId',
	ComponentPath = 'componentPath',
	Id = 'id',
	Internal___Type = 'internal___type',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
}

export enum SitePageConnectionSortOrderValues {
	Asc = 'ASC',
	Desc = 'DESC',
}

export enum SitePageDistinctEnum {
	JsonName = 'jsonName',
	InternalComponentName = 'internalComponentName',
	Path = 'path',
	Component = 'component',
	ComponentChunkName = 'componentChunkName',
	PluginCreator___Node = 'pluginCreator___NODE',
	PluginCreatorId = 'pluginCreatorId',
	ComponentPath = 'componentPath',
	Id = 'id',
	Internal___Type = 'internal___type',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
}

/** An edge in a connection. */
export type SitePageEdge = {
	/** The item at the end of the edge */
	node?: Maybe<SitePage>;
	/** The next edge in the connection */
	next?: Maybe<SitePage>;
	/** The previous edge in the connection */
	previous?: Maybe<SitePage>;
};

/** A connection to a list of items. */
export type SitePageGroupConnectionConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<SitePageGroupConnectionEdge>>>;
	field?: Maybe<Scalars['String']>;
	fieldValue?: Maybe<Scalars['String']>;
	totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type SitePageGroupConnectionEdge = {
	/** The item at the end of the edge */
	node?: Maybe<SitePage>;
	/** The next edge in the connection */
	next?: Maybe<SitePage>;
	/** The previous edge in the connection */
	previous?: Maybe<SitePage>;
};

export enum SitePageGroupEnum {
	JsonName = 'jsonName',
	InternalComponentName = 'internalComponentName',
	Path = 'path',
	Component = 'component',
	ComponentChunkName = 'componentChunkName',
	PluginCreator___Node = 'pluginCreator___NODE',
	PluginCreatorId = 'pluginCreatorId',
	ComponentPath = 'componentPath',
	Id = 'id',
	Internal___Type = 'internal___type',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Description = 'internal___description',
	Internal___Owner = 'internal___owner',
}

export type SitePageIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageInternalComponentNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageInternalDescriptionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageInternalInputObject_2 = {
	type?: Maybe<SitePageInternalTypeQueryString_2>;
	contentDigest?: Maybe<SitePageInternalContentDigestQueryString_2>;
	description?: Maybe<SitePageInternalDescriptionQueryString>;
	owner?: Maybe<SitePageInternalOwnerQueryString_2>;
};

export type SitePageInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePageJsonNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorBrowserApIsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorIdQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorInputObject = {
	resolve?: Maybe<SitePagePluginCreatorResolveQueryString>;
	id?: Maybe<SitePagePluginCreatorIdQueryString>;
	name?: Maybe<SitePagePluginCreatorNameQueryString>;
	version?: Maybe<SitePagePluginCreatorVersionQueryString>;
	pluginOptions?: Maybe<SitePagePluginCreatorPluginOptionsInputObject>;
	nodeAPIs?: Maybe<SitePagePluginCreatorNodeApIsQueryList>;
	browserAPIs?: Maybe<SitePagePluginCreatorBrowserApIsQueryList>;
	ssrAPIs?: Maybe<SitePagePluginCreatorSsrApIsQueryList>;
	pluginFilepath?: Maybe<SitePagePluginCreatorPluginFilepathQueryString>;
	packageJson?: Maybe<SitePagePluginCreatorPackageJsonInputObject>;
	internal?: Maybe<SitePagePluginCreatorInternalInputObject>;
};

export type SitePagePluginCreatorInternalContentDigestQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorInternalInputObject = {
	contentDigest?: Maybe<SitePagePluginCreatorInternalContentDigestQueryString>;
	type?: Maybe<SitePagePluginCreatorInternalTypeQueryString>;
	owner?: Maybe<SitePagePluginCreatorInternalOwnerQueryString>;
};

export type SitePagePluginCreatorInternalOwnerQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorInternalTypeQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorNodeApIsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonAuthorQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonDependenciesInputObject = {
	name?: Maybe<SitePagePluginCreatorPackageJsonDependenciesNameQueryString>;
	version?: Maybe<
		SitePagePluginCreatorPackageJsonDependenciesVersionQueryString
	>;
};

export type SitePagePluginCreatorPackageJsonDependenciesNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonDependenciesQueryList = {
	elemMatch?: Maybe<SitePagePluginCreatorPackageJsonDependenciesInputObject>;
};

export type SitePagePluginCreatorPackageJsonDependenciesVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonDescriptionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonDevDependenciesInputObject = {
	name?: Maybe<SitePagePluginCreatorPackageJsonDevDependenciesNameQueryString>;
	version?: Maybe<
		SitePagePluginCreatorPackageJsonDevDependenciesVersionQueryString
	>;
};

export type SitePagePluginCreatorPackageJsonDevDependenciesNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonDevDependenciesQueryList = {
	elemMatch?: Maybe<SitePagePluginCreatorPackageJsonDevDependenciesInputObject>;
};

export type SitePagePluginCreatorPackageJsonDevDependenciesVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonInputObject = {
	name?: Maybe<SitePagePluginCreatorPackageJsonNameQueryString>;
	description?: Maybe<SitePagePluginCreatorPackageJsonDescriptionQueryString>;
	version?: Maybe<SitePagePluginCreatorPackageJsonVersionQueryString>;
	main?: Maybe<SitePagePluginCreatorPackageJsonMainQueryString>;
	author?: Maybe<SitePagePluginCreatorPackageJsonAuthorQueryString>;
	license?: Maybe<SitePagePluginCreatorPackageJsonLicenseQueryString>;
	dependencies?: Maybe<SitePagePluginCreatorPackageJsonDependenciesQueryList>;
	devDependencies?: Maybe<
		SitePagePluginCreatorPackageJsonDevDependenciesQueryList
	>;
	peerDependencies?: Maybe<
		SitePagePluginCreatorPackageJsonPeerDependenciesQueryList
	>;
	keywords?: Maybe<SitePagePluginCreatorPackageJsonKeywordsQueryList>;
};

export type SitePagePluginCreatorPackageJsonKeywordsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonLicenseQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonMainQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonPeerDependenciesInputObject = {
	name?: Maybe<SitePagePluginCreatorPackageJsonPeerDependenciesNameQueryString>;
	version?: Maybe<
		SitePagePluginCreatorPackageJsonPeerDependenciesVersionQueryString
	>;
};

export type SitePagePluginCreatorPackageJsonPeerDependenciesNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonPeerDependenciesQueryList = {
	elemMatch?: Maybe<
		SitePagePluginCreatorPackageJsonPeerDependenciesInputObject
	>;
};

export type SitePagePluginCreatorPackageJsonPeerDependenciesVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPackageJsonVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginFilepathQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsBackgroundColorQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsDisplayQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsFieldNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsIconQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsInputObject = {
	typeName?: Maybe<SitePagePluginCreatorPluginOptionsTypeNameQueryString>;
	fieldName?: Maybe<SitePagePluginCreatorPluginOptionsFieldNameQueryString>;
	url?: Maybe<SitePagePluginCreatorPluginOptionsUrlQueryString>;
	name?: Maybe<SitePagePluginCreatorPluginOptionsNameQueryString>;
	path?: Maybe<SitePagePluginCreatorPluginOptionsPathQueryString>;
	short_name?: Maybe<SitePagePluginCreatorPluginOptionsShortNameQueryString>;
	start_url?: Maybe<SitePagePluginCreatorPluginOptionsStartUrlQueryString>;
	background_color?: Maybe<
		SitePagePluginCreatorPluginOptionsBackgroundColorQueryString
	>;
	theme_color?: Maybe<SitePagePluginCreatorPluginOptionsThemeColorQueryString>;
	display?: Maybe<SitePagePluginCreatorPluginOptionsDisplayQueryString>;
	icon?: Maybe<SitePagePluginCreatorPluginOptionsIconQueryString>;
	pathCheck?: Maybe<SitePagePluginCreatorPluginOptionsPathCheckQueryBoolean>;
};

export type SitePagePluginCreatorPluginOptionsNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsPathCheckQueryBoolean = {
	eq?: Maybe<Scalars['Boolean']>;
	ne?: Maybe<Scalars['Boolean']>;
	in?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
};

export type SitePagePluginCreatorPluginOptionsPathQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsShortNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsStartUrlQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsThemeColorQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsTypeNameQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorPluginOptionsUrlQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorResolveQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorSsrApIsQueryList = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePagePluginCreatorVersionQueryString = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePathPrefixQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** Node of type SitePlugin */
export type SitePlugin = Node & {
	/** The id of this node. */
	id: Scalars['ID'];
	/** The parent of this node. */
	parent?: Maybe<Node>;
	/** The children of this node. */
	children?: Maybe<Array<Maybe<Node>>>;
	resolve?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	version?: Maybe<Scalars['String']>;
	pluginOptions?: Maybe<PluginOptions_2>;
	nodeAPIs?: Maybe<Array<Maybe<Scalars['String']>>>;
	browserAPIs?: Maybe<Array<Maybe<Scalars['String']>>>;
	ssrAPIs?: Maybe<Array<Maybe<Scalars['String']>>>;
	pluginFilepath?: Maybe<Scalars['String']>;
	packageJson?: Maybe<PackageJson_2>;
	internal?: Maybe<Internal_8>;
};

export type SitePluginBrowserApIsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** A connection to a list of items. */
export type SitePluginConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<SitePluginEdge>>>;
	totalCount?: Maybe<Scalars['Int']>;
	distinct?: Maybe<Array<Maybe<Scalars['String']>>>;
	group?: Maybe<Array<Maybe<SitePluginGroupConnectionConnection>>>;
};

/** A connection to a list of items. */
export type SitePluginConnectionDistinctArgs = {
	field?: Maybe<SitePluginDistinctEnum>;
};

/** A connection to a list of items. */
export type SitePluginConnectionGroupArgs = {
	skip?: Maybe<Scalars['Int']>;
	limit?: Maybe<Scalars['Int']>;
	field?: Maybe<SitePluginGroupEnum>;
};

export type SitePluginConnectionBrowserApIsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionInternalInputObject_2 = {
	contentDigest?: Maybe<SitePluginConnectionInternalContentDigestQueryString_2>;
	type?: Maybe<SitePluginConnectionInternalTypeQueryString_2>;
	owner?: Maybe<SitePluginConnectionInternalOwnerQueryString_2>;
};

export type SitePluginConnectionInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionNodeApIsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonAuthorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonDependenciesInputObject_2 = {
	name?: Maybe<SitePluginConnectionPackageJsonDependenciesNameQueryString_2>;
	version?: Maybe<
		SitePluginConnectionPackageJsonDependenciesVersionQueryString_2
	>;
};

export type SitePluginConnectionPackageJsonDependenciesNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonDependenciesQueryList_2 = {
	elemMatch?: Maybe<SitePluginConnectionPackageJsonDependenciesInputObject_2>;
};

export type SitePluginConnectionPackageJsonDependenciesVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonDevDependenciesInputObject_2 = {
	name?: Maybe<SitePluginConnectionPackageJsonDevDependenciesNameQueryString_2>;
	version?: Maybe<
		SitePluginConnectionPackageJsonDevDependenciesVersionQueryString_2
	>;
};

export type SitePluginConnectionPackageJsonDevDependenciesNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonDevDependenciesQueryList_2 = {
	elemMatch?: Maybe<
		SitePluginConnectionPackageJsonDevDependenciesInputObject_2
	>;
};

export type SitePluginConnectionPackageJsonDevDependenciesVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonInputObject_2 = {
	name?: Maybe<SitePluginConnectionPackageJsonNameQueryString_2>;
	description?: Maybe<SitePluginConnectionPackageJsonDescriptionQueryString_2>;
	version?: Maybe<SitePluginConnectionPackageJsonVersionQueryString_2>;
	main?: Maybe<SitePluginConnectionPackageJsonMainQueryString_2>;
	author?: Maybe<SitePluginConnectionPackageJsonAuthorQueryString_2>;
	license?: Maybe<SitePluginConnectionPackageJsonLicenseQueryString_2>;
	dependencies?: Maybe<SitePluginConnectionPackageJsonDependenciesQueryList_2>;
	devDependencies?: Maybe<
		SitePluginConnectionPackageJsonDevDependenciesQueryList_2
	>;
	peerDependencies?: Maybe<
		SitePluginConnectionPackageJsonPeerDependenciesQueryList_2
	>;
	keywords?: Maybe<SitePluginConnectionPackageJsonKeywordsQueryList_2>;
};

export type SitePluginConnectionPackageJsonKeywordsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonLicenseQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonMainQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonPeerDependenciesInputObject_2 = {
	name?: Maybe<
		SitePluginConnectionPackageJsonPeerDependenciesNameQueryString_2
	>;
	version?: Maybe<
		SitePluginConnectionPackageJsonPeerDependenciesVersionQueryString_2
	>;
};

export type SitePluginConnectionPackageJsonPeerDependenciesNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonPeerDependenciesQueryList_2 = {
	elemMatch?: Maybe<
		SitePluginConnectionPackageJsonPeerDependenciesInputObject_2
	>;
};

export type SitePluginConnectionPackageJsonPeerDependenciesVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPackageJsonVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginFilepathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsBackgroundColorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsDisplayQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsFieldNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsIconQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsInputObject_2 = {
	typeName?: Maybe<SitePluginConnectionPluginOptionsTypeNameQueryString_2>;
	fieldName?: Maybe<SitePluginConnectionPluginOptionsFieldNameQueryString_2>;
	url?: Maybe<SitePluginConnectionPluginOptionsUrlQueryString_2>;
	name?: Maybe<SitePluginConnectionPluginOptionsNameQueryString_2>;
	path?: Maybe<SitePluginConnectionPluginOptionsPathQueryString_2>;
	short_name?: Maybe<SitePluginConnectionPluginOptionsShortNameQueryString_2>;
	start_url?: Maybe<SitePluginConnectionPluginOptionsStartUrlQueryString_2>;
	background_color?: Maybe<
		SitePluginConnectionPluginOptionsBackgroundColorQueryString_2
	>;
	theme_color?: Maybe<SitePluginConnectionPluginOptionsThemeColorQueryString_2>;
	display?: Maybe<SitePluginConnectionPluginOptionsDisplayQueryString_2>;
	icon?: Maybe<SitePluginConnectionPluginOptionsIconQueryString_2>;
	pathCheck?: Maybe<SitePluginConnectionPluginOptionsPathCheckQueryBoolean_2>;
};

export type SitePluginConnectionPluginOptionsNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsPathCheckQueryBoolean_2 = {
	eq?: Maybe<Scalars['Boolean']>;
	ne?: Maybe<Scalars['Boolean']>;
	in?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
};

export type SitePluginConnectionPluginOptionsPathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsShortNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsStartUrlQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsThemeColorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsTypeNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionPluginOptionsUrlQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionResolveQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionSort = {
	fields: Array<Maybe<SitePluginConnectionSortByFieldsEnum>>;
	order?: Maybe<Array<Maybe<SitePluginConnectionSortOrderValues>>>;
};

export enum SitePluginConnectionSortByFieldsEnum {
	Resolve = 'resolve',
	Id = 'id',
	Name = 'name',
	Version = 'version',
	PluginOptions___TypeName = 'pluginOptions___typeName',
	PluginOptions___FieldName = 'pluginOptions___fieldName',
	PluginOptions___Url = 'pluginOptions___url',
	PluginOptions___Name = 'pluginOptions___name',
	PluginOptions___Path = 'pluginOptions___path',
	PluginOptions___Short_Name = 'pluginOptions___short_name',
	PluginOptions___Start_Url = 'pluginOptions___start_url',
	PluginOptions___Background_Color = 'pluginOptions___background_color',
	PluginOptions___Theme_Color = 'pluginOptions___theme_color',
	PluginOptions___Display = 'pluginOptions___display',
	PluginOptions___Icon = 'pluginOptions___icon',
	PluginOptions___PathCheck = 'pluginOptions___pathCheck',
	NodeApIs = 'nodeAPIs',
	BrowserApIs = 'browserAPIs',
	SsrApIs = 'ssrAPIs',
	PluginFilepath = 'pluginFilepath',
	PackageJson___Name = 'packageJson___name',
	PackageJson___Description = 'packageJson___description',
	PackageJson___Version = 'packageJson___version',
	PackageJson___Main = 'packageJson___main',
	PackageJson___Author = 'packageJson___author',
	PackageJson___License = 'packageJson___license',
	PackageJson___Dependencies = 'packageJson___dependencies',
	PackageJson___DevDependencies = 'packageJson___devDependencies',
	PackageJson___PeerDependencies = 'packageJson___peerDependencies',
	PackageJson___Keywords = 'packageJson___keywords',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Owner = 'internal___owner',
}

export enum SitePluginConnectionSortOrderValues {
	Asc = 'ASC',
	Desc = 'DESC',
}

export type SitePluginConnectionSsrApIsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginConnectionVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum SitePluginDistinctEnum {
	Resolve = 'resolve',
	Id = 'id',
	Name = 'name',
	Version = 'version',
	PluginOptions___TypeName = 'pluginOptions___typeName',
	PluginOptions___FieldName = 'pluginOptions___fieldName',
	PluginOptions___Url = 'pluginOptions___url',
	PluginOptions___Name = 'pluginOptions___name',
	PluginOptions___Path = 'pluginOptions___path',
	PluginOptions___Short_Name = 'pluginOptions___short_name',
	PluginOptions___Start_Url = 'pluginOptions___start_url',
	PluginOptions___Background_Color = 'pluginOptions___background_color',
	PluginOptions___Theme_Color = 'pluginOptions___theme_color',
	PluginOptions___Display = 'pluginOptions___display',
	PluginOptions___Icon = 'pluginOptions___icon',
	PluginOptions___PathCheck = 'pluginOptions___pathCheck',
	NodeApIs = 'nodeAPIs',
	BrowserApIs = 'browserAPIs',
	SsrApIs = 'ssrAPIs',
	PluginFilepath = 'pluginFilepath',
	PackageJson___Name = 'packageJson___name',
	PackageJson___Description = 'packageJson___description',
	PackageJson___Version = 'packageJson___version',
	PackageJson___Main = 'packageJson___main',
	PackageJson___Author = 'packageJson___author',
	PackageJson___License = 'packageJson___license',
	PackageJson___Dependencies = 'packageJson___dependencies',
	PackageJson___DevDependencies = 'packageJson___devDependencies',
	PackageJson___PeerDependencies = 'packageJson___peerDependencies',
	PackageJson___Keywords = 'packageJson___keywords',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Owner = 'internal___owner',
}

/** An edge in a connection. */
export type SitePluginEdge = {
	/** The item at the end of the edge */
	node?: Maybe<SitePlugin>;
	/** The next edge in the connection */
	next?: Maybe<SitePlugin>;
	/** The previous edge in the connection */
	previous?: Maybe<SitePlugin>;
};

/** A connection to a list of items. */
export type SitePluginGroupConnectionConnection = {
	/** Information to aid in pagination. */
	pageInfo: PageInfo;
	/** A list of edges. */
	edges?: Maybe<Array<Maybe<SitePluginGroupConnectionEdge>>>;
	field?: Maybe<Scalars['String']>;
	fieldValue?: Maybe<Scalars['String']>;
	totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type SitePluginGroupConnectionEdge = {
	/** The item at the end of the edge */
	node?: Maybe<SitePlugin>;
	/** The next edge in the connection */
	next?: Maybe<SitePlugin>;
	/** The previous edge in the connection */
	previous?: Maybe<SitePlugin>;
};

export enum SitePluginGroupEnum {
	Resolve = 'resolve',
	Id = 'id',
	Name = 'name',
	Version = 'version',
	PluginOptions___TypeName = 'pluginOptions___typeName',
	PluginOptions___FieldName = 'pluginOptions___fieldName',
	PluginOptions___Url = 'pluginOptions___url',
	PluginOptions___Name = 'pluginOptions___name',
	PluginOptions___Path = 'pluginOptions___path',
	PluginOptions___Short_Name = 'pluginOptions___short_name',
	PluginOptions___Start_Url = 'pluginOptions___start_url',
	PluginOptions___Background_Color = 'pluginOptions___background_color',
	PluginOptions___Theme_Color = 'pluginOptions___theme_color',
	PluginOptions___Display = 'pluginOptions___display',
	PluginOptions___Icon = 'pluginOptions___icon',
	PluginOptions___PathCheck = 'pluginOptions___pathCheck',
	NodeApIs = 'nodeAPIs',
	BrowserApIs = 'browserAPIs',
	SsrApIs = 'ssrAPIs',
	PluginFilepath = 'pluginFilepath',
	PackageJson___Name = 'packageJson___name',
	PackageJson___Description = 'packageJson___description',
	PackageJson___Version = 'packageJson___version',
	PackageJson___Main = 'packageJson___main',
	PackageJson___Author = 'packageJson___author',
	PackageJson___License = 'packageJson___license',
	PackageJson___Dependencies = 'packageJson___dependencies',
	PackageJson___DevDependencies = 'packageJson___devDependencies',
	PackageJson___PeerDependencies = 'packageJson___peerDependencies',
	PackageJson___Keywords = 'packageJson___keywords',
	Internal___ContentDigest = 'internal___contentDigest',
	Internal___Type = 'internal___type',
	Internal___Owner = 'internal___owner',
}

export type SitePluginIdQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginInternalContentDigestQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginInternalInputObject_2 = {
	contentDigest?: Maybe<SitePluginInternalContentDigestQueryString_2>;
	type?: Maybe<SitePluginInternalTypeQueryString_2>;
	owner?: Maybe<SitePluginInternalOwnerQueryString_2>;
};

export type SitePluginInternalOwnerQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginInternalTypeQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginNodeApIsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonAuthorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonDependenciesInputObject_2 = {
	name?: Maybe<SitePluginPackageJsonDependenciesNameQueryString_2>;
	version?: Maybe<SitePluginPackageJsonDependenciesVersionQueryString_2>;
};

export type SitePluginPackageJsonDependenciesNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonDependenciesQueryList_2 = {
	elemMatch?: Maybe<SitePluginPackageJsonDependenciesInputObject_2>;
};

export type SitePluginPackageJsonDependenciesVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonDevDependenciesInputObject_2 = {
	name?: Maybe<SitePluginPackageJsonDevDependenciesNameQueryString_2>;
	version?: Maybe<SitePluginPackageJsonDevDependenciesVersionQueryString_2>;
};

export type SitePluginPackageJsonDevDependenciesNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonDevDependenciesQueryList_2 = {
	elemMatch?: Maybe<SitePluginPackageJsonDevDependenciesInputObject_2>;
};

export type SitePluginPackageJsonDevDependenciesVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonInputObject_2 = {
	name?: Maybe<SitePluginPackageJsonNameQueryString_2>;
	description?: Maybe<SitePluginPackageJsonDescriptionQueryString_2>;
	version?: Maybe<SitePluginPackageJsonVersionQueryString_2>;
	main?: Maybe<SitePluginPackageJsonMainQueryString_2>;
	author?: Maybe<SitePluginPackageJsonAuthorQueryString_2>;
	license?: Maybe<SitePluginPackageJsonLicenseQueryString_2>;
	dependencies?: Maybe<SitePluginPackageJsonDependenciesQueryList_2>;
	devDependencies?: Maybe<SitePluginPackageJsonDevDependenciesQueryList_2>;
	peerDependencies?: Maybe<SitePluginPackageJsonPeerDependenciesQueryList_2>;
	keywords?: Maybe<SitePluginPackageJsonKeywordsQueryList_2>;
};

export type SitePluginPackageJsonKeywordsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonLicenseQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonMainQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonPeerDependenciesInputObject_2 = {
	name?: Maybe<SitePluginPackageJsonPeerDependenciesNameQueryString_2>;
	version?: Maybe<SitePluginPackageJsonPeerDependenciesVersionQueryString_2>;
};

export type SitePluginPackageJsonPeerDependenciesNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonPeerDependenciesQueryList_2 = {
	elemMatch?: Maybe<SitePluginPackageJsonPeerDependenciesInputObject_2>;
};

export type SitePluginPackageJsonPeerDependenciesVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPackageJsonVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginFilepathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsBackgroundColorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsDisplayQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsFieldNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsIconQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsInputObject_2 = {
	typeName?: Maybe<SitePluginPluginOptionsTypeNameQueryString_2>;
	fieldName?: Maybe<SitePluginPluginOptionsFieldNameQueryString_2>;
	url?: Maybe<SitePluginPluginOptionsUrlQueryString_2>;
	name?: Maybe<SitePluginPluginOptionsNameQueryString_2>;
	path?: Maybe<SitePluginPluginOptionsPathQueryString_2>;
	short_name?: Maybe<SitePluginPluginOptionsShortNameQueryString_2>;
	start_url?: Maybe<SitePluginPluginOptionsStartUrlQueryString_2>;
	background_color?: Maybe<SitePluginPluginOptionsBackgroundColorQueryString_2>;
	theme_color?: Maybe<SitePluginPluginOptionsThemeColorQueryString_2>;
	display?: Maybe<SitePluginPluginOptionsDisplayQueryString_2>;
	icon?: Maybe<SitePluginPluginOptionsIconQueryString_2>;
	pathCheck?: Maybe<SitePluginPluginOptionsPathCheckQueryBoolean_2>;
};

export type SitePluginPluginOptionsNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsPathCheckQueryBoolean_2 = {
	eq?: Maybe<Scalars['Boolean']>;
	ne?: Maybe<Scalars['Boolean']>;
	in?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
};

export type SitePluginPluginOptionsPathQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsShortNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsStartUrlQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsThemeColorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsTypeNameQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginPluginOptionsUrlQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginResolveQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginSsrApIsQueryList_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePluginVersionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SitePolyfillQueryBoolean_2 = {
	eq?: Maybe<Scalars['Boolean']>;
	ne?: Maybe<Scalars['Boolean']>;
	in?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
};

export type SitePortQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteSiteMetadataAuthorQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteSiteMetadataDescriptionQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SiteSiteMetadataInputObject_2 = {
	title?: Maybe<SiteSiteMetadataTitleQueryString_2>;
	description?: Maybe<SiteSiteMetadataDescriptionQueryString_2>;
	author?: Maybe<SiteSiteMetadataAuthorQueryString_2>;
};

export type SiteSiteMetadataTitleQueryString_2 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesAspectRatioQueryFloat_3 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type SizesAspectRatioQueryFloat_4 = {
	eq?: Maybe<Scalars['Float']>;
	ne?: Maybe<Scalars['Float']>;
	gt?: Maybe<Scalars['Float']>;
	gte?: Maybe<Scalars['Float']>;
	lt?: Maybe<Scalars['Float']>;
	lte?: Maybe<Scalars['Float']>;
	in?: Maybe<Array<Maybe<Scalars['Float']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type SizesBase64QueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesBase64QueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesOriginalImgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesOriginalImgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesOriginalNameQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesOriginalNameQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesPresentationHeightQueryInt_3 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type SizesPresentationHeightQueryInt_4 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type SizesPresentationWidthQueryInt_3 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type SizesPresentationWidthQueryInt_4 = {
	eq?: Maybe<Scalars['Int']>;
	ne?: Maybe<Scalars['Int']>;
	gt?: Maybe<Scalars['Int']>;
	gte?: Maybe<Scalars['Int']>;
	lt?: Maybe<Scalars['Int']>;
	lte?: Maybe<Scalars['Int']>;
	in?: Maybe<Array<Maybe<Scalars['Int']>>>;
	nin?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type SizesSizesQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSizesQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcSetQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcSetQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcSetWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcSetWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcWebpQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesSrcWebpQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesTracedSvgQueryString_3 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesTracedSvgQueryString_4 = {
	eq?: Maybe<Scalars['String']>;
	ne?: Maybe<Scalars['String']>;
	regex?: Maybe<Scalars['String']>;
	glob?: Maybe<Scalars['String']>;
	in?: Maybe<Array<Maybe<Scalars['String']>>>;
	nin?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type SizesTypeName_3 = {
	base64?: Maybe<SizesBase64QueryString_3>;
	tracedSVG?: Maybe<SizesTracedSvgQueryString_3>;
	aspectRatio?: Maybe<SizesAspectRatioQueryFloat_3>;
	src?: Maybe<SizesSrcQueryString_3>;
	srcSet?: Maybe<SizesSrcSetQueryString_3>;
	srcWebp?: Maybe<SizesSrcWebpQueryString_3>;
	srcSetWebp?: Maybe<SizesSrcSetWebpQueryString_3>;
	sizes?: Maybe<SizesSizesQueryString_3>;
	originalImg?: Maybe<SizesOriginalImgQueryString_3>;
	originalName?: Maybe<SizesOriginalNameQueryString_3>;
	presentationWidth?: Maybe<SizesPresentationWidthQueryInt_3>;
	presentationHeight?: Maybe<SizesPresentationHeightQueryInt_3>;
};

export type SizesTypeName_4 = {
	base64?: Maybe<SizesBase64QueryString_4>;
	tracedSVG?: Maybe<SizesTracedSvgQueryString_4>;
	aspectRatio?: Maybe<SizesAspectRatioQueryFloat_4>;
	src?: Maybe<SizesSrcQueryString_4>;
	srcSet?: Maybe<SizesSrcSetQueryString_4>;
	srcWebp?: Maybe<SizesSrcWebpQueryString_4>;
	srcSetWebp?: Maybe<SizesSrcSetWebpQueryString_4>;
	sizes?: Maybe<SizesSizesQueryString_4>;
	originalImg?: Maybe<SizesOriginalImgQueryString_4>;
	originalName?: Maybe<SizesOriginalNameQueryString_4>;
	presentationWidth?: Maybe<SizesPresentationWidthQueryInt_4>;
	presentationHeight?: Maybe<SizesPresentationHeightQueryInt_4>;
};
export type SiteTitleQueryQueryVariables = {};

export type SiteTitleQueryQuery = { __typename?: 'Query' } & {
	site: Maybe<
		{ __typename?: 'Site' } & {
			siteMetadata: Maybe<
				{ __typename?: 'siteMetadata_2' } & Pick<SiteMetadata_2, 'title'>
			>;
		}
	>;
};

export type Unnamed_1_QueryVariables = {};

export type Unnamed_1_Query = { __typename?: 'Query' } & {
	site: Maybe<
		{ __typename?: 'Site' } & {
			siteMetadata: Maybe<
				{ __typename?: 'siteMetadata_2' } & Pick<
					SiteMetadata_2,
					'title' | 'description' | 'author'
				>
			>;
		}
	>;
};
