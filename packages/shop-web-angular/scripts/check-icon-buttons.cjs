/**
 * Guards against icon-only buttons that screen readers announce as just "button".
 *
 * Fails (exit code 1) when a `<button>` in the checked templates has no visible
 * text and no accessible name (`aria-label`, `[attr.aria-label]` or
 * `aria-labelledby`).
 *
 * What counts as visible text: text that is not inside `<svg>`, `<mat-icon>`,
 * `<ever-icon>`, `<i class="material-icons">` (a ligature such as
 * `keyboard_arrow_left` is read aloud letter by letter, it is not a label) or an
 * element marked `aria-hidden="true"`, `hidden` or `style="display: none"`.
 * Everything nested in such an element is ignored too, including a nested element
 * of the same name. Template interpolations such as `{{ 'KEY' | translate }}`
 * count as text; an empty `{{ }}` does not.
 *
 * Usage: node scripts/check-icon-buttons.cjs
 *
 * Note: this file is `.cjs` because the package's .gitignore ignores `**\/*.js`
 * (compiled output), which would keep a `.js` script out of version control.
 */
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'src', 'app');

/** Templates covered by this check (paths relative to `src/app`). */
const TEMPLATES = [
	'toolbar/toolbar.component.html',
	'+products/product-details/product-details.component.html',
	'+orders/order/order.component.html'
];

// Opening tag whose attributes may contain `>` inside quotes (e.g. `(click)="a > b"`).
const BUTTON_RE = /<button\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/button\s*>/gi;
// One attribute: a name, then an optional double-quoted, single-quoted or bare value.
const ATTRIBUTE_RE = /([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const ARIA_NAME_ATTRIBUTES = new Set(['aria-label', '[attr.aria-label]', 'aria-labelledby', '[attr.aria-labelledby]']);

/**
 * Parses the attributes of an opening tag into `{ name, value }` pairs (`value` is
 * null for a boolean attribute). Matching by attribute name, instead of searching
 * the raw attribute text, keeps a word inside a quoted value, such as
 * `title="Show hidden files"`, from being read as an attribute.
 */
function parseAttributes(attributes) {
	const parsed = [];
	let match;
	ATTRIBUTE_RE.lastIndex = 0;
	while ((match = ATTRIBUTE_RE.exec(attributes)) !== null) {
		const [, name, doubleQuoted, singleQuoted, bare] = match;
		const value = [doubleQuoted, singleQuoted, bare].find((part) => part !== undefined);
		parsed.push({ name: name.toLowerCase(), value: value === undefined ? null : value });
	}
	return parsed;
}

/** True when the tag has a non-blank `aria-label` or `aria-labelledby` (static or bound). */
function hasAriaName(attributes) {
	return parseAttributes(attributes).some(
		({ name, value }) => ARIA_NAME_ATTRIBUTES.has(name) && value !== null && value.trim() !== ''
	);
}

/** Blank out a match with spaces/newlines so character offsets and line numbers stay valid. */
function blank(match) {
	return match.replace(/[^\n]/g, ' ');
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ICON_TAGS = new Set(['svg', 'mat-icon', 'ever-icon']);
// `aria-hidden="true"`, or `[attr.aria-hidden]="true"` / `"'true'"`.
const ARIA_HIDDEN_VALUES = new Set(['true', "'true'", '"true"']);

/** True when a static attribute hides the element from screen readers or from view. */
function isHiddenAttribute({ name, value }) {
	const trimmed = value === null ? '' : value.trim().toLowerCase();
	return (
		name === 'hidden' ||
		((name === 'aria-hidden' || name === '[attr.aria-hidden]') && ARIA_HIDDEN_VALUES.has(trimmed)) ||
		(name === 'style' && /\bdisplay\s*:\s*none/.test(trimmed))
	);
}

// A tag (with quote-aware attributes), a run of text, or a stray `<`.
const TOKEN_RE = /<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g;

/** True when an element must not count as visible text: hidden, or an icon whose ligature is not a label. */
function isIgnored(name, attributes) {
	const parsed = parseAttributes(attributes);
	return (
		ICON_TAGS.has(name) ||
		(name === 'i' &&
			parsed.some((attribute) => attribute.name === 'class' && /\bmaterial-icons\b/i.test(attribute.value || ''))) ||
		parsed.some(isHiddenAttribute)
	);
}

/**
 * Returns the text a sighted user would see inside a button's content.
 *
 * Walks the tags with a stack, so an ignored element hides everything nested in
 * it, even when it contains another element of the same name.
 */
function visibleText(inner) {
	const stack = [];
	let ignoredDepth = 0;
	let text = '';
	let token;
	TOKEN_RE.lastIndex = 0;
	inner = inner.replace(/<!--[\s\S]*?-->/g, ' ');
	while ((token = TOKEN_RE.exec(inner)) !== null) {
		const [whole, closing, rawName, attributes] = token;
		if (rawName === undefined) {
			if (ignoredDepth === 0 && whole !== '<') {
				text += whole;
			}
			continue;
		}
		const name = rawName.toLowerCase();
		if (closing) {
			const index = stack.map((entry) => entry.name).lastIndexOf(name);
			if (index >= 0) {
				stack.splice(index).forEach((entry) => {
					ignoredDepth -= entry.ignored ? 1 : 0;
				});
			}
			continue;
		}
		if (VOID_TAGS.has(name) || /\/\s*$/.test(attributes)) {
			continue;
		}
		const ignored = isIgnored(name, attributes);
		stack.push({ name, ignored });
		ignoredDepth += ignored ? 1 : 0;
	}
	// An empty interpolation renders nothing, so it is not a label either.
	return text.replace(/\{\{\s*\}\}/g, ' ').replace(/&nbsp;/g, ' ').trim();
}

/** Returns one problem description per unnamed icon-only button of `html`. */
function findProblems(html) {
	const problems = [];
	const source = html.replace(/<!--[\s\S]*?-->/g, blank);
	let match;
	BUTTON_RE.lastIndex = 0;
	while ((match = BUTTON_RE.exec(source)) !== null) {
		const [, attributes, inner] = match;
		if (hasAriaName(attributes) || visibleText(inner).length > 0) {
			continue;
		}
		const line = source.slice(0, match.index).split('\n').length;
		problems.push({ line, snippet: match[0].split('\n')[0].trim() });
	}
	return problems;
}

/** Counts the buttons of `html`, so the check can refuse to pass vacuously. */
function countButtons(html) {
	const source = html.replace(/<!--[\s\S]*?-->/g, blank);
	return (source.match(BUTTON_RE) || []).length;
}

function main() {
	let failed = false;
	let totalButtons = 0;

	for (const template of TEMPLATES) {
		const file = path.join(APP_DIR, template);
		const html = fs.readFileSync(file, 'utf8');
		const buttons = countButtons(html);
		const problems = findProblems(html);
		totalButtons += buttons;

		if (problems.length === 0) {
			console.log(`OK    ${template} (${buttons} buttons)`);
			continue;
		}

		failed = true;
		console.error(`FAIL  ${template}`);
		problems.forEach(({ line, snippet }) =>
			console.error(`  line ${line}: button has no visible text and no aria-label: ${snippet}`)
		);
	}

	// Refuse to pass vacuously: if the templates moved or the pattern broke, nothing was checked.
	if (totalButtons === 0) {
		console.error(`No <button> found in ${TEMPLATES.length} templates; the check is not looking at anything.`);
		process.exit(1);
	}

	if (failed) {
		console.error('\nGive icon-only buttons a translated aria-label and mark the icon aria-hidden="true".');
		process.exit(1);
	}

	console.log(`\nAll ${totalButtons} buttons in ${TEMPLATES.length} templates have a visible text or an aria-label.`);
}

if (require.main === module) {
	main();
}

module.exports = { findProblems, visibleText };
