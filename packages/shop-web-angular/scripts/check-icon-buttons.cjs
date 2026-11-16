/**
 * Guards against icon-only buttons that screen readers announce as just "button".
 *
 * Fails (exit code 1) when a `<button>` in the checked templates has no visible
 * text and no accessible name (`aria-label`, `[attr.aria-label]` or
 * `aria-labelledby`).
 *
 * What counts as visible text: anything left after removing `<svg>`, `<mat-icon>`,
 * `<ever-icon>`, `<i class="material-icons">` (a ligature such as
 * `keyboard_arrow_left` is read aloud letter by letter, it is not a label) and
 * every element marked `aria-hidden="true"`. Template interpolations such as
 * `{{ 'KEY' | translate }}` count as text.
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
const ARIA_NAME_RE = /(?:^|\s)(?:\[attr\.aria-label\]|aria-label|aria-labelledby|\[attr\.aria-labelledby\])\s*=\s*(?:"[^"]*[^"\s][^"]*"|'[^']*[^'\s][^']*')/i;

/** Blank out a match with spaces/newlines so character offsets and line numbers stay valid. */
function blank(match) {
	return match.replace(/[^\n]/g, ' ');
}

/** Returns the text a sighted user would see inside a button's content. */
function visibleText(inner) {
	let text = inner
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/<svg\b[\s\S]*?<\/svg\s*>/gi, ' ')
		.replace(/<(mat-icon|ever-icon)\b[\s\S]*?<\/\1\s*>/gi, ' ')
		.replace(/<ever-icon\b[^>]*\/>/gi, ' ')
		.replace(/<i\b[^>]*\bclass\s*=\s*"[^"]*\bmaterial-icons\b[^"]*"[^>]*>[\s\S]*?<\/i\s*>/gi, ' ');

	// Drop elements hidden from assistive technology (innermost first, so nesting is handled).
	const hidden = /<([a-z][\w-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*\baria-hidden\s*=\s*"true"(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/\1\s*>/gi;
	let previous;
	do {
		previous = text;
		text = text.replace(hidden, ' ');
	} while (text !== previous);

	return text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
}

/** Returns one problem description per unnamed icon-only button of `html`. */
function findProblems(html) {
	const problems = [];
	const source = html.replace(/<!--[\s\S]*?-->/g, blank);
	let match;
	BUTTON_RE.lastIndex = 0;
	while ((match = BUTTON_RE.exec(source)) !== null) {
		const [, attributes, inner] = match;
		if (ARIA_NAME_RE.test(' ' + attributes) || visibleText(inner).length > 0) {
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
