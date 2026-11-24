/**
 * Regression cases for scripts/check-icon-buttons.cjs.
 *
 * Usage: node scripts/check-icon-buttons.test.cjs
 */
const assert = require('assert');
const { findProblems } = require('./check-icon-buttons.cjs');

/** Buttons that have no accessible name: each must be reported exactly once. */
const UNNAMED = {
	'only an svg': '<button><svg viewBox="0 0 24 24"><path d="M0 0"/></svg></button>',
	'only an icon component': '<button><ever-icon type="settings"></ever-icon></button>',
	'double-quoted material icon ligature': '<button><i class="material-icons">keyboard_arrow_left</i></button>',
	'single-quoted material icon ligature': "<button><i class='material-icons'>settings</i></button>",
	'ligature in a mat-icon': '<button><mat-icon>close</mat-icon></button>',
	'double-quoted aria-hidden text': '<button><span aria-hidden="true">Close</span></button>',
	'single-quoted aria-hidden text': "<button><span aria-hidden='true'>Close</span></button>",
	'nested same-name element in an aria-hidden one':
		'<button><span aria-hidden="true"><span>icon</span>decorative</span></button>',
	'nested same-name element in a single-quoted aria-hidden one':
		"<button><div aria-hidden='true'><div>icon</div>Close</div></button>",
	'bound aria-hidden': '<button><span [attr.aria-hidden]="\'true\'">Close</span></button>',
	'hidden attribute': '<button><span hidden>Close</span></button>',
	'display none': '<button><span style="display: none">Close</span></button>',
	'empty interpolation': '<button>{{ }}</button>',
	'empty aria-label': '<button aria-label="">\n<svg></svg></button>',
	'whitespace and comment only': '<button> <!-- Close --> &nbsp; </button>',
	'aria-label text inside another attribute value': '<button title="see aria-label=\'Close\'"><svg></svg></button>',
	'link with only an icon component': '<a href="/auth/google" class="login-button"><fa-icon [icon]="[\'fab\', \'google\']"></fa-icon></a>',
	'link with only an aria-hidden icon':
		'<a\n\thref="/auth/facebook"\n>\n\t<fa-icon [icon]="[\'fab\', \'facebook\']" aria-hidden="true"></fa-icon>\n</a>',
	'link with only a decorative image': '<a routerLink="/"><img src="logo.svg" alt="" /></a>',
	'link with an image that has no alt': '<a routerLink="/"><img src="logo.svg" /></a>',
	'link with an image bound to an empty alt': '<a routerLink="/"><img src="logo.svg" [alt]="\'\'" /></a>',
	'link with an aria-hidden image': '<a routerLink="/"><img src="logo.svg" alt="Home" aria-hidden="true" /></a>',
	'upper-case link tag': '<A href="/x"><svg></svg></A>'
};

/** Buttons that have a visible text or an accessible name: none may be reported. */
const NAMED = {
	'plain text': '<button>Close</button>',
	'interpolated translation': "<button><svg></svg>{{ 'CLOSE' | translate }}</button>",
	'text next to an aria-hidden icon': '<button><span aria-hidden="true">x</span>Close</button>',
	'text after a nested hidden element':
		'<button><span aria-hidden="true"><span>icon</span>decorative</span> Close</button>',
	'text inside a visible wrapper': '<button><span><b>Close</b></span></button>',
	'the word hidden inside another attribute value': '<button><span title="Show hidden files">Show files</span></button>',
	'aria-hidden text inside another attribute value': '<button><span title="no aria-hidden=\'true\' here">Go</span></button>',
	'aria-label': '<button aria-label="Close"><svg></svg></button>',
	'bound aria-label': "<button [attr.aria-label]=\"'CLOSE' | translate\"><i class=\"material-icons\">close</i></button>",
	'aria-labelledby': '<button aria-labelledby="title"><svg></svg></button>',
	'attribute value containing a greater-than sign': '<button (click)="a > b && go()">Go</button>',
	'link with text': '<a href="/about">About</a>',
	'link with a bound aria-label and an aria-hidden icon':
		'<a\n\thref="/auth/google"\n\t[attr.aria-label]="\'LOG_IN_VIEW.CONTINUE_WITH_GOOGLE\' | translate"\n>\n\t<fa-icon [icon]="[\'fab\', \'google\']" aria-hidden="true"></fa-icon>\n</a>',
	'link with an image that has a translated alt': '<a routerLink="/"><img src="logo.svg" [alt]="\'HOME\' | translate" /></a>',
	'button with an image that has an alt': '<button><img src="close.svg" alt="Close"></button>',
	'an abbr tag is not taken for an a tag': '<abbr title="x"><svg></svg></abbr>',
	'an area tag is not taken for an a tag': '<map><area href="/x" alt="X"></map>'
};

let failures = 0;

for (const [name, html] of Object.entries(UNNAMED)) {
	const problems = findProblems(html);
	if (problems.length !== 1) {
		failures++;
		console.error(`FAIL  should be reported (${name}): got ${problems.length} problems`);
	}
}

for (const [name, html] of Object.entries(NAMED)) {
	const problems = findProblems(html);
	if (problems.length !== 0) {
		failures++;
		console.error(`FAIL  should pass (${name}): got ${problems.length} problems`);
	}
}

assert.strictEqual(
	findProblems('<div>\n<button>Ok</button>\n<button><svg></svg></button>\n</div>')[0].line,
	3,
	'the reported line number must point at the offending button'
);

assert.strictEqual(
	findProblems('<div>\n<a href="/">Home</a>\n<a href="/x"><svg></svg></a>\n</div>')[0].tag,
	'a',
	'a problem on a link must name the <a> tag'
);

if (failures > 0) {
	console.error(`\n${failures} case(s) failed.`);
	process.exit(1);
}

console.log(`OK    ${Object.keys(UNNAMED).length + Object.keys(NAMED).length} check-icon-buttons cases passed.`);
