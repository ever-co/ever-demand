import { Writable } from 'stream';
import {
	CloudWatchLogsClient,
	CloudWatchLogsClientConfig,
	CreateLogGroupCommand,
	CreateLogStreamCommand,
	PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';

/** PutLogEvents takes at most 10,000 events per call. */
const MAX_EVENTS_PER_CALL = 10000;

export interface CloudWatchStreamOptions {
	logGroupName: string;
	logStreamName: string;
	/** Options of the AWS SDK v3 CloudWatch Logs client, e.g. `{ region }`. */
	cloudWatchLogsOptions?: CloudWatchLogsClientConfig;
	/** How long records are collected before they are sent, in ms. */
	writeInterval?: number;
	/** The client to use instead of creating one (tests). */
	client?: Pick<CloudWatchLogsClient, 'send'>;
	/** Called when CloudWatch refuses a batch; defaults to console.error. */
	onError?: (err: unknown) => void;
}

/** Clients that found no AWS credentials: every stream using them stops. */
const clientsWithoutCredentials = new WeakSet<object>();

interface LogEvent {
	timestamp: number;
	message: string;
}

/**
 * A bunyan "raw" stream that sends log records to AWS CloudWatch Logs, in
 * batches (replaces bunyan-cloudwatch, which needs the end-of-life aws-sdk v2).
 * The log group and stream are created when they don't exist yet. A failed
 * batch is reported through `onError` and dropped, so logging never crashes
 * the API. Without AWS credentials the stream reports that once and stops.
 */
export class CloudWatchStream extends Writable {
	private readonly client: Pick<CloudWatchLogsClient, 'send'>;
	private readonly logGroupName: string;
	private readonly logStreamName: string;
	private readonly writeInterval: number;
	private readonly onError: (err: unknown) => void;

	private queue: LogEvent[] = [];
	private timer?: NodeJS.Timeout;
	private flushing?: Promise<void>;
	private created?: Promise<void>;

	constructor(options: CloudWatchStreamOptions) {
		super({ objectMode: true });

		this.logGroupName = options.logGroupName;
		this.logStreamName = options.logStreamName;
		this.writeInterval = options.writeInterval ?? 1000;
		this.client =
			options.client ??
			new CloudWatchLogsClient(options.cloudWatchLogsOptions ?? {});
		this.onError =
			options.onError ??
			((err) => console.error('CloudWatch logging failed', err));
	}

	override _write(
		record: unknown,
		_encoding: BufferEncoding,
		callback: (error?: Error | null) => void
	) {
		if (!this.disabled) {
			this.queue.push(toLogEvent(record));
			this.scheduleFlush();
		}
		callback();
	}

	override _final(callback: (error?: Error | null) => void) {
		this.flush().then(() => callback(), callback);
	}

	private get disabled(): boolean {
		return clientsWithoutCredentials.has(this.client);
	}

	/** Sends every queued record now. */
	async flush(): Promise<void> {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}

		while (this.flushing !== undefined) {
			await this.flushing;
		}

		if (this.queue.length === 0) {
			return;
		}

		this.flushing = this.sendQueued().finally(() => {
			this.flushing = undefined;
		});

		await this.flushing;
	}

	private scheduleFlush() {
		if (this.timer) {
			return;
		}

		this.timer = setTimeout(() => {
			this.timer = undefined;
			this.flush().catch(this.onError);
		}, this.writeInterval);

		// a pending batch must not keep the process alive
		this.timer.unref?.();
	}

	private async sendQueued() {
		while (this.queue.length > 0) {
			const batch = this.queue
				.splice(0, MAX_EVENTS_PER_CALL)
				// CloudWatch wants the events of a call in chronological order
				.sort((a, b) => a.timestamp - b.timestamp);

			try {
				await this.ensureLogStream();
				await this.client.send(
					new PutLogEventsCommand({
						logGroupName: this.logGroupName,
						logStreamName: this.logStreamName,
						logEvents: batch,
					})
				);
			} catch (err) {
				if (errorName(err) === 'ResourceNotFoundException') {
					// deleted meanwhile: create it again for the next batch
					this.created = undefined;
				}

				if (errorName(err) === 'CredentialsProviderError') {
					// No AWS credentials: they do not show up later, so every
					// stream of this client stops; reported once, not per batch.
					const reported = this.disabled;
					clientsWithoutCredentials.add(this.client);
					this.queue = [];
					if (reported) {
						continue;
					}
				}

				this.onError(err);
			}
		}
	}

	private ensureLogStream(): Promise<void> {
		if (!this.created) {
			this.created = (async () => {
				await this.sendIgnoringExisting(
					new CreateLogGroupCommand({ logGroupName: this.logGroupName })
				);
				await this.sendIgnoringExisting(
					new CreateLogStreamCommand({
						logGroupName: this.logGroupName,
						logStreamName: this.logStreamName,
					})
				);
			})().catch((err) => {
				this.created = undefined;
				throw err;
			});
		}

		return this.created;
	}

	private async sendIgnoringExisting(command: any) {
		try {
			await this.client.send(command);
		} catch (err) {
			if (errorName(err) !== 'ResourceAlreadyExistsException') {
				throw err;
			}
		}
	}
}

function errorName(err: unknown): string | undefined {
	return err && typeof err === 'object' && 'name' in err
		? String((err as { name: unknown }).name)
		: undefined;
}

function toLogEvent(record: unknown): LogEvent {
	if (typeof record === 'string') {
		return { timestamp: Date.now(), message: record };
	}

	const time = (record as { time?: unknown } | null)?.time;
	const timestamp =
		time instanceof Date || typeof time === 'string' || typeof time === 'number'
			? new Date(time).getTime()
			: NaN;

	return {
		timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
		message: JSON.stringify(record),
	};
}
