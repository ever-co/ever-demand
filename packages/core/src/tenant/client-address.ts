/**
 * The client address of a request that may have come through proxies,
 * by the same rule as Express' 'trust proxy' (proxy-addr), so HTTP (req.ip)
 * and socket.io / graphql-ws agree: start at the connection's peer and, while
 * that address is a trusted proxy, step to the next X-Forwarded-For entry from
 * the right. The first untrusted address is the client. A directly exposed
 * API (untrusted peer) never reads X-Forwarded-For, which a client could fake.
 *
 * TRUST_PROXY: a hop count (`1`), or a comma list of `loopback`, `linklocal`,
 * `uniquelocal`, addresses and IPv4 CIDRs (e.g. Cloudflare's ranges in front
 * of the ingress); empty = trust nothing.
 */

type Trust = (address: string, hop: number) => boolean;

const NAMED: Record<string, string[]> = {
	loopback: ['127.0.0.0/8', '::1/128'],
	linklocal: ['169.254.0.0/16', 'fe80::/10'],
	uniquelocal: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'fc00::/7'],
};

/** `::ffff:10.1.2.3` → `10.1.2.3`; brackets and zone ids dropped. */
function normalize(address: string): string {
	const plain = address
		.trim()
		.replace(/^\[|\]$/g, '')
		.replace(/%.*$/, '');
	const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(plain);

	return (mapped ? mapped[1] : plain).toLowerCase();
}

function ipv4ToNumber(ip: string): number | null {
	const parts = ip.split('.');

	if (
		parts.length !== 4 ||
		parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)
	) {
		return null;
	}

	return parts.reduce((n, p) => n * 256 + Number(p), 0);
}

/** An IPv6 address as 8 groups of 16 bits; null when it is not one. */
function ipv6Groups(ip: string): number[] | null {
	if (!ip.includes(':')) {
		return null;
	}

	const [head, tail, more] = ip.split('::');

	if (more !== undefined) {
		return null;
	}

	const left = head ? head.split(':') : [];
	const right = tail !== undefined && tail !== '' ? tail.split(':') : [];
	const missing = 8 - left.length - right.length;

	if ((tail === undefined && missing !== 0) || missing < 0) {
		return null;
	}

	const groups = [
		...left,
		...Array(tail === undefined ? 0 : missing).fill('0'),
		...right,
	];

	if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) {
		return null;
	}

	return groups.map((g) => parseInt(g, 16));
}

/** Whether `address` lies in `range` (an address or a CIDR, IPv4 or IPv6). */
function inRange(address: string, range: string): boolean {
	const [base, bitsText] = range.split('/');
	const v4 = ipv4ToNumber(address);
	const baseV4 = ipv4ToNumber(base);

	if (v4 !== null && baseV4 !== null) {
		const bits = bitsText === undefined ? 32 : Number(bitsText);
		const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
		return (v4 & mask) >>> 0 === (baseV4 & mask) >>> 0;
	}

	const v6 = ipv6Groups(address);
	const baseV6 = ipv6Groups(normalize(base));

	if (v6 === null || baseV6 === null) {
		return false;
	}

	let bits = bitsText === undefined ? 128 : Number(bitsText);

	for (let i = 0; i < 8 && bits > 0; i += 1, bits -= 16) {
		const mask = bits >= 16 ? 0xffff : (0xffff << (16 - bits)) & 0xffff;

		if ((v6[i] & mask) !== (baseV6[i] & mask)) {
			return false;
		}
	}

	return true;
}

const parsed = new Map<string, Trust>();

/** The trust function of a TRUST_PROXY value (cached). */
export function trustOf(setting: string | null | undefined): Trust {
	const key = String(setting ?? '').trim();
	const cached = parsed.get(key);

	if (cached) {
		return cached;
	}

	let trust: Trust;

	if (key === '') {
		trust = () => false;
	} else if (/^\d+$/.test(key)) {
		const hops = Number(key);
		trust = (_address, hop) => hop < hops;
	} else {
		const ranges = key
			.split(',')
			.map((part) => part.trim().toLowerCase())
			.filter(Boolean)
			.flatMap((part) => NAMED[part] ?? [part]);

		trust = (address) =>
			ranges.some((range) => inRange(normalize(address), range));
	}

	parsed.set(key, trust);

	return trust;
}

/** The client address (see above); undefined when nothing is known. */
export function clientAddressBy(
	setting: string | null | undefined,
	remoteAddress: string | null | undefined,
	forwardedFor: string | string[] | null | undefined,
): string | undefined {
	if (!remoteAddress) {
		return undefined;
	}

	const trust = trustOf(setting);
	const header = Array.isArray(forwardedFor)
		? forwardedFor.join(',')
		: (forwardedFor ?? '');
	const hops = String(header)
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean)
		.reverse();
	const chain = [normalize(remoteAddress), ...hops.map(normalize)];

	for (let i = 0; i < chain.length - 1; i += 1) {
		if (!trust(chain[i], i)) {
			return chain[i];
		}
	}

	return chain[chain.length - 1];
}
