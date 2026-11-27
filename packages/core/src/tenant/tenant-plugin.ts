import type { Schema, Query, Aggregate, Model } from 'mongoose';
import {
	TenantContext,
	TenantContextMissingError,
} from './tenant-context';

export const TENANT_FIELD = 'tenantId';

/** Query operations whose filter gets `tenantId`. */
export const TENANT_QUERY_OPS = [
	'countDocuments',
	'deleteMany',
	'deleteOne',
	'distinct',
	'find',
	'findOne',
	'findOneAndDelete',
	'findOneAndReplace',
	'findOneAndUpdate',
	'replaceOne',
	'updateMany',
	'updateOne',
] as const;

const REPLACE_OPS = new Set(['replaceOne', 'findOneAndReplace']);

/** A record of another tenant was about to be written. */
export class TenantMismatchError extends Error {
	readonly name = 'TenantMismatchError';

	constructor(what: string) {
		super(`${what} belongs to another tenant`);
	}
}

export function isTenantSchema(schema: Schema): boolean {
	if (typeof (schema as any)?.path === 'function') {
		return schema.path(TENANT_FIELD) != null;
	}

	return (schema as any)?.paths?.[TENANT_FIELD] != null;
}

/**
 * The tenant a query on `what` must be limited to: the current tenant,
 * `undefined` for system work (no filter), or TenantContextMissingError.
 */
export function scopeTenantId(what: string): string | undefined {
	if (TenantContext.isSystem()) {
		return undefined;
	}

	const tenantId = TenantContext.tenantId();

	if (tenantId == null) {
		throw new TenantContextMissingError(what);
	}

	return tenantId;
}

const UPDATE_OPERATORS = [
	'$set',
	'$setOnInsert',
	'$unset',
	'$rename',
	'$inc',
	'$mul',
	'$min',
	'$max',
	'$push',
	'$addToSet',
	'$pull',
	'$pullAll',
	'$pop',
	'$currentDate',
];

/**
 * Removes every attempt to change `tenantId` from an update document (top
 * level and under the update operators). An aggregation-pipeline update is
 * refused: it could compute a new `tenantId`.
 */
export function scrubTenantFromUpdate(update: any): void {
	if (update == null || typeof update !== 'object') {
		return;
	}

	if (Array.isArray(update)) {
		throw new Error(
			'Pipeline updates are not allowed on tenant-owned collections'
		);
	}

	delete update[TENANT_FIELD];

	for (const op of UPDATE_OPERATORS) {
		scrubTenantFromOperator(op, update[op]);
	}
}

/** Removes `tenantId` from the fields of one update operator (and renames to it). */
function scrubTenantFromOperator(op: string, fields: any): void {
	if (fields == null || typeof fields !== 'object') {
		return;
	}

	delete fields[TENANT_FIELD];

	if (op !== '$rename') {
		return;
	}

	for (const [from, to] of Object.entries(fields)) {
		if (to === TENANT_FIELD) {
			delete fields[from];
		}
	}
}

/** Adds the tenant filter to a query and keeps its update from moving records. */
export function applyTenantToQuery(query: Query<any, any>): void {
	const modelName = query.model?.modelName ?? 'query';
	const tenantId = scopeTenantId(modelName);

	if (tenantId === undefined) {
		return;
	}

	query.where({ [TENANT_FIELD]: tenantId });

	const update = query.getUpdate() as any;

	if (update == null) {
		return;
	}

	if (REPLACE_OPS.has((query as any).op)) {
		// a replacement document must keep the record in its tenant
		update[TENANT_FIELD] = tenantId;
	} else {
		scrubTenantFromUpdate(update);
	}
}

/**
 * Sets `tenantId` on a new record, or checks it. Refuses to create a record
 * in another tenant, and to move an existing one.
 */
export function stampDocument(
	doc: any,
	what: string,
	isNew: boolean = true
): void {
	if (TenantContext.isSystem()) {
		// system work states the tenant itself; validation requires it
		return;
	}

	const tenantId = TenantContext.tenantId();

	if (tenantId == null) {
		throw new TenantContextMissingError(what);
	}

	const current = doc.get ? doc.get(TENANT_FIELD) : doc[TENANT_FIELD];

	if (isNew) {
		if (current != null && String(current) !== tenantId) {
			throw new TenantMismatchError(what);
		}

		if (doc.set) {
			doc.set(TENANT_FIELD, tenantId);
		} else {
			doc[TENANT_FIELD] = tenantId;
		}
	} else if (current == null || String(current) !== tenantId) {
		throw new TenantMismatchError(what);
	}
}

/** Collection names of the tenant-owned models of the connection of `model`. */
function tenantCollections(model: Model<any> | undefined): Set<string> {
	const names = new Set<string>();
	const models = model?.db?.models ?? {};

	for (const m of Object.values<Model<any>>(models as any)) {
		if (isTenantSchema(m.schema)) {
			names.add(m.collection.collectionName);
		}
	}

	return names;
}

const FORBIDDEN_STAGES = ['$out', '$merge'];

/**
 * Limits an aggregation pipeline to one tenant: a leading `$match`, or the
 * `query` of a leading `$geoNear` (which must stay the first stage), plus a
 * `$match` inside every `$lookup` / `$unionWith` and a `restrictSearchWithMatch`
 * on every `$graphLookup` that reads a tenant-owned collection. Writing stages
 * are refused.
 */
export function applyTenantToPipeline(
	pipeline: any[],
	tenantId: string,
	tenantCollectionNames: Set<string>
): void {
	const scope: PipelineScope = {
		match: { [TENANT_FIELD]: tenantId },
		collections: tenantCollectionNames,
	};

	scopeStages(pipeline, scope);

	const first = pipeline[0];

	if (first?.$geoNear != null) {
		first.$geoNear.query = { ...(first.$geoNear.query ?? {}), ...scope.match };
	} else {
		pipeline.unshift({ $match: scope.match });
	}
}

interface PipelineScope {
	/** `{ tenantId }` of the current tenant */
	match: Record<string, string>;
	/** Collections of the tenant-owned models */
	collections: Set<string>;
}

/** Scopes every stage (and every nested pipeline) that reads a tenant-owned collection. */
function scopeStages(stages: any[], scope: PipelineScope): void {
	for (const stage of stages) {
		refuseWritingStages(stage);
		scopeLookup(stage.$lookup, scope);
		scopeUnionWith(stage, scope);
		scopeGraphLookup(stage.$graphLookup, scope);
		scopeFacet(stage.$facet, scope);
	}
}

function refuseWritingStages(stage: any): void {
	for (const name of FORBIDDEN_STAGES) {
		if (stage[name] != null) {
			throw new Error(`${name} is not allowed in a tenant-scoped aggregation`);
		}
	}
}

function scopeLookup(lookup: any, scope: PipelineScope): void {
	if (lookup == null) {
		return;
	}

	if (scope.collections.has(lookup.from)) {
		lookup.pipeline = [{ $match: scope.match }, ...(lookup.pipeline ?? [])];
		scopeStages(lookup.pipeline.slice(1), scope);
	} else if (lookup.pipeline) {
		scopeStages(lookup.pipeline, scope);
	}
}

function scopeUnionWith(stage: any, scope: PipelineScope): void {
	const union = stage.$unionWith;

	if (union == null) {
		return;
	}

	const coll = typeof union === 'string' ? union : union.coll;
	const nested: any[] = typeof union === 'string' ? [] : union.pipeline ?? [];

	// a nested pipeline is scoped whatever it unions with (it may $lookup a tenant collection)
	scopeStages(nested, scope);

	if (scope.collections.has(coll)) {
		stage.$unionWith = { coll, pipeline: [{ $match: scope.match }, ...nested] };
	}
}

function scopeGraphLookup(graph: any, scope: PipelineScope): void {
	if (graph != null && scope.collections.has(graph.from)) {
		graph.restrictSearchWithMatch = {
			...(graph.restrictSearchWithMatch ?? {}),
			...scope.match,
		};
	}
}

function scopeFacet(facet: any, scope: PipelineScope): void {
	if (facet == null) {
		return;
	}

	for (const sub of Object.values<any[]>(facet)) {
		scopeStages(sub, scope);
	}
}

/**
 * Mongoose plugin for every schema: on tenant-owned schemas (those with a
 * `tenantId` path) it filters every query, stamps every new record and
 * limits every aggregation to the current tenant. Without a tenant (and
 * outside `TenantContext.runAsSystem`) these operations throw, so a code
 * path that forgot the tenant fails instead of leaking another tenant's data.
 *
 * Register it with `mongoose.plugin(tenantPlugin)` before any model is
 * compiled.
 */
export function tenantPlugin(schema: Schema): void {
	if (!isTenantSchema(schema)) {
		return;
	}

	schema.pre(
		TENANT_QUERY_OPS as unknown as any[],
		{ document: false, query: true },
		function (this: Query<any, any>) {
			applyTenantToQuery(this);
		}
	);

	schema.pre('estimatedDocumentCount' as any, function () {
		if (!TenantContext.isSystem()) {
			throw new Error(
				'estimatedDocumentCount reads every tenant: use countDocuments'
			);
		}
	});

	schema.pre('validate', function (this: any) {
		stampDocument(this, this.constructor?.modelName ?? 'document', this.isNew);
	});

	schema.pre('save', function (this: any) {
		if (this.isNew || this.isModified(TENANT_FIELD)) {
			stampDocument(
				this,
				this.constructor?.modelName ?? 'document',
				this.isNew
			);
		}
	});

	schema.pre('insertMany', function (this: Model<any>, docs: any) {
		const list = Array.isArray(docs) ? docs : [docs];

		for (const doc of list) {
			stampDocument(doc, this.modelName, true);
		}
	});

	schema.pre('bulkWrite', function () {
		if (!TenantContext.isSystem()) {
			throw new Error(
				'bulkWrite is not tenant-scoped: use the per-record operations'
			);
		}
	});

	schema.pre('aggregate', function (this: Aggregate<any>) {
		const model = (this as any).model() as Model<any> | undefined;
		const tenantId = scopeTenantId(model?.modelName ?? 'aggregate');

		if (tenantId === undefined) {
			return;
		}

		applyTenantToPipeline(this.pipeline(), tenantId, tenantCollections(model));
	});
}
