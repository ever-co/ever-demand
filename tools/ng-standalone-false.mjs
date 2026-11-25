#!/usr/bin/env node
// Adds `standalone: false` to every @Component/@Directive/@Pipe decorator that does not set
// `standalone` yet. Angular 19+ made standalone the default, so classes declared in an NgModule
// must opt out explicitly (this is what the Angular v19 `ng update` migration does).
//
// Usage: node tools/ng-standalone-false.mjs <dir> [<dir> ...]
import fs from 'node:fs';
import path from 'node:path';

const DECORATOR = /@(Component|Directive|Pipe)\s*\(\s*\{/g;

function patch(source) {
	let out = '';
	let last = 0;
	let changed = 0;
	for (const m of source.matchAll(DECORATOR)) {
		const open = m.index + m[0].length - 1; // index of '{'
		let depth = 0;
		let end = -1;
		let quote = null;
		for (let i = open; i < source.length; i++) {
			const c = source[i];
			if (quote) {
				if (c === String.fromCharCode(92)) i++; // backslash escape
				else if (c === quote) quote = null;
				continue;
			}
			if (c === "'" || c === '"' || c === '`') quote = c;
			else if (c === '{') depth++;
			else if (c === '}' && --depth === 0) {
				end = i;
				break;
			}
		}
		if (end < 0) continue;
		const body = source.slice(open + 1, end);
		if (/\bstandalone\s*:/.test(body)) continue;
		const nl = source.includes('\r\n') ? '\r\n' : '\n';
		const indent = (body.match(/\n([ \t]+)\S/) || [, '\t'])[1];
		const singleLine = !body.includes(String.fromCharCode(10));
		const insert =
			body.trim() === ''
				? ' standalone: false '
				: singleLine
					? ' standalone: false,' + (body.startsWith(' ') ? '' : ' ')
					: `${nl}${indent}standalone: false,`;
		out += source.slice(last, open + 1) + insert;
		last = open + 1;
		changed++;
	}
	return changed ? { text: out + source.slice(last), changed } : null;
}

function walk(dir, files = []) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p, files);
		else if (p.endsWith('.ts') && !p.endsWith('.spec.ts') && !p.endsWith('.d.ts')) files.push(p);
	}
	return files;
}

let total = 0;
for (const dir of process.argv.slice(2)) {
	for (const f of walk(dir)) {
		const r = patch(fs.readFileSync(f, 'utf8'));
		if (r) {
			fs.writeFileSync(f, r.text);
			total += r.changed;
		}
	}
}
console.log(`standalone: false added to ${total} decorator(s)`);
