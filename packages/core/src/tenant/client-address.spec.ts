import { clientAddressBy } from './client-address';

const DEFAULT = 'loopback, uniquelocal';

describe('clientAddressBy (the TRUST_PROXY rule of Express, for sockets too)', () => {
	it('reads X-Forwarded-For through a trusted ingress (10.x, loopback)', () => {
		expect(clientAddressBy(DEFAULT, '10.0.3.7', '198.51.100.7')).toBe(
			'198.51.100.7',
		);
		expect(
			clientAddressBy(DEFAULT, '::ffff:127.0.0.1', '198.51.100.7'),
		).toBe('198.51.100.7');
		expect(clientAddressBy(DEFAULT, '::1', '2001:db8::5')).toBe(
			'2001:db8::5',
		);
	});

	it('takes the right-most untrusted hop, not a forged left-most one', () => {
		// the client sent "1.1.1.1" itself; the ingress appended the real address
		expect(
			clientAddressBy(DEFAULT, '10.0.3.7', '1.1.1.1, 198.51.100.7'),
		).toBe('198.51.100.7');
		// two trusted hops (sidecar, ingress) are skipped
		expect(
			clientAddressBy(DEFAULT, '127.0.0.1', '198.51.100.7, 10.0.0.9'),
		).toBe('198.51.100.7');
	});

	it('never trusts X-Forwarded-For from an untrusted peer (a directly exposed API)', () => {
		expect(clientAddressBy(DEFAULT, '203.0.113.50', '1.2.3.4')).toBe(
			'203.0.113.50',
		);
		expect(clientAddressBy('', '127.0.0.1', '1.2.3.4')).toBe('127.0.0.1');
	});

	it('gives the real client behind Cloudflare and the ingress when both are trusted', () => {
		const cloudflare = `${DEFAULT}, 172.64.0.0/13`;

		expect(
			clientAddressBy(cloudflare, '10.0.3.7', '198.51.100.7, 172.70.1.2'),
		).toBe('198.51.100.7');
		// without Cloudflare's range, the Cloudflare edge is the client
		expect(
			clientAddressBy(DEFAULT, '10.0.3.7', '198.51.100.7, 172.70.1.2'),
		).toBe('172.70.1.2');
	});

	it('supports a hop count', () => {
		expect(
			clientAddressBy('1', '203.0.113.50', '1.1.1.1, 198.51.100.7'),
		).toBe('198.51.100.7');
		expect(
			clientAddressBy('2', '203.0.113.50', '1.1.1.1, 198.51.100.7'),
		).toBe('1.1.1.1');
	});

	it('uses the peer when there is no header, and knows nothing without a peer', () => {
		expect(clientAddressBy(DEFAULT, '10.0.3.7', undefined)).toBe(
			'10.0.3.7',
		);
		expect(clientAddressBy(DEFAULT, undefined, '1.2.3.4')).toBeUndefined();
	});
});
