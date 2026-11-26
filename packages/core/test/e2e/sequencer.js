// Runs the suites in a fixed order, the fake-data generator last: it spreads
// generated orders over every store, which would change the counts the other
// suites check for their own stores.
const Sequencer = require('@jest/test-sequencer').default;

class E2eSequencer extends Sequencer {
	sort(tests) {
		const rank = (t) => (/fake-data/.test(t.path) ? 1 : 0);
		return [...tests].sort(
			(a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path)
		);
	}
}

module.exports = E2eSequencer;
