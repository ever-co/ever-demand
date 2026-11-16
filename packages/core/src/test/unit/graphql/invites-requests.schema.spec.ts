import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import {
	DocumentNode,
	Kind,
	ObjectTypeDefinitionNode,
	ObjectTypeExtensionNode,
	parse,
} from 'graphql';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

// Only the resolver decorators are read below, so its service is a stub.
jest.mock('../../../services/invites', () => ({
	InvitesRequestsService: class {},
}));
jest.mock('../../../env', () => ({
	env: { FAKE_DATA_GENERATOR: false },
}));

import { InviteRequestResolver } from '../../../graphql/invites-requests/invites-requests.resolver';

// Keys `@Query()` writes (RESOLVER_TYPE_METADATA / RESOLVER_NAME_METADATA in
// @nestjs/graphql); an unnamed `@Query()` resolves the field named after the
// method.
const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
const RESOLVER_NAME_METADATA = 'graphql:resolver_name';

function resolvedQueries(resolver: { prototype: any }): string[] {
	const prototype = resolver.prototype;

	return Object.getOwnPropertyNames(prototype)
		.filter(
			(key) =>
				typeof prototype[key] === 'function' &&
				Reflect.getMetadata(RESOLVER_TYPE_METADATA, prototype[key]) ===
					'Query'
		)
		.map(
			(key) =>
				Reflect.getMetadata(RESOLVER_NAME_METADATA, prototype[key]) ||
				key
		);
}

const SRC_DIR = path.join(__dirname, '..', '..', '..');

const INVITES_REQUESTS_TYPES = path.join(
	SRC_DIR,
	'graphql',
	'invites-requests',
	'invites-requests.types.graphql'
);

function queryFields(document: DocumentNode): string[] {
	return document.definitions
		.filter(
			(
				definition
			): definition is
				| ObjectTypeDefinitionNode
				| ObjectTypeExtensionNode =>
				(definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
					definition.kind === Kind.OBJECT_TYPE_EXTENSION) &&
				definition.name.value === 'Query'
		)
		.reduce(
			(fields, definition) => [
				...fields,
				...(definition.fields || []).map((field) => field.name.value),
			],
			[] as string[]
		);
}

describe('notifyAboutLaunch is not part of the public GraphQL API', () => {
	it('invites-requests.types.graphql declares no Query.notifyAboutLaunch', () => {
		const fields = queryFields(
			parse(fs.readFileSync(INVITES_REQUESTS_TYPES, 'utf8'))
		);

		expect(fields).toEqual(
			expect.arrayContaining([
				'inviteRequest',
				'invitesRequests',
				'getCountOfInvitesRequests',
			])
		);
		expect(fields).not.toContain('notifyAboutLaunch');
	});

	it('the schema merged from every *.graphql file has no Query.notifyAboutLaunch', () => {
		// Same files and merge AppModule.createSchema() serves.
		const typeDefs = mergeTypeDefs(
			loadFilesSync(
				path.join(SRC_DIR, '**', '*.graphql').replace(/\\/g, '/')
			),
			{ throwOnConflict: true }
		);

		const fields = queryFields(typeDefs);

		expect(fields).toContain('inviteRequest');
		expect(fields).not.toContain('notifyAboutLaunch');
	});

	it('InviteRequestResolver resolves no notifyAboutLaunch query', () => {
		const queries = resolvedQueries(InviteRequestResolver);

		expect(queries).toEqual(
			expect.arrayContaining(['inviteRequest', 'invitesRequests'])
		);
		expect(queries).not.toContain('notifyAboutLaunch');
	});
});
