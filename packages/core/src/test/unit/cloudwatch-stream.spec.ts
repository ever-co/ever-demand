import {
	CreateLogGroupCommand,
	CreateLogStreamCommand,
	PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchStream } from '../../helpers/cloudwatch-stream';

function awsError(name: string) {
	const err = new Error(name);
	err.name = name;
	return err;
}

describe('CloudWatchStream (bunyan raw stream)', () => {
	let send: jest.Mock;
	let client: { send: jest.Mock };
	let onError: jest.Mock;

	const create = () =>
		new CloudWatchStream({
			logGroupName: 'ever/api',
			logStreamName: 'info_main_host',
			writeInterval: 10,
			client: client as any,
			onError,
		});

	const putCalls = () =>
		send.mock.calls.map(([c]) => c).filter((c) => c instanceof PutLogEventsCommand);

	beforeEach(() => {
		send = jest.fn().mockResolvedValue({});
		// one client per test, shared by its streams (as Log.ts does)
		client = { send };
		onError = jest.fn();
	});

	it('creates the log group and stream once, then sends the records in one batch', async () => {
		const stream = create();

		stream.write({ time: new Date('2026-11-25T10:00:01Z'), msg: 'second' });
		stream.write({ time: new Date('2026-11-25T10:00:00Z'), msg: 'first' });
		await stream.flush();

		stream.write({ time: new Date('2026-11-25T10:00:02Z'), msg: 'third' });
		await stream.flush();

		const commands = send.mock.calls.map(([c]) => c);
		expect(commands[0]).toBeInstanceOf(CreateLogGroupCommand);
		expect(commands[0].input).toEqual({ logGroupName: 'ever/api' });
		expect(commands[1]).toBeInstanceOf(CreateLogStreamCommand);
		expect(commands[1].input).toEqual({ logGroupName: 'ever/api', logStreamName: 'info_main_host' });
		expect(commands.filter((c) => c instanceof CreateLogGroupCommand)).toHaveLength(1);

		const [firstBatch, secondBatch] = putCalls();
		// chronological order inside a batch
		expect(firstBatch.input.logEvents.map((e) => JSON.parse(e.message).msg)).toEqual(['first', 'second']);
		expect(firstBatch.input.logEvents[0].timestamp).toBe(Date.parse('2026-11-25T10:00:00Z'));
		expect(secondBatch.input.logEvents).toHaveLength(1);
		expect(onError).not.toHaveBeenCalled();
	});

	it('sends queued records on its own after the write interval', async () => {
		const stream = create();

		stream.write({ time: new Date().toISOString(), msg: 'later' });
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(putCalls()).toHaveLength(1);
	});

	it('takes a log group and stream that already exist', async () => {
		send.mockImplementation(async (command) => {
			if (!(command instanceof PutLogEventsCommand)) {
				throw awsError('ResourceAlreadyExistsException');
			}
			return {};
		});

		const stream = create();
		stream.write({ msg: 'x' });
		await stream.flush();

		expect(putCalls()).toHaveLength(1);
		expect(onError).not.toHaveBeenCalled();
	});

	it('reports a refused batch, drops it and keeps logging', async () => {
		let puts = 0;
		send.mockImplementation(async (command) => {
			if (command instanceof PutLogEventsCommand && ++puts === 1) {
				throw awsError('ThrottlingException');
			}
			return {};
		});

		const stream = create();
		stream.write({ msg: 'lost' });
		await stream.flush();
		stream.write({ msg: 'kept' });
		await stream.flush();

		expect(onError).toHaveBeenCalledWith(expect.objectContaining({ name: 'ThrottlingException' }));
		expect(putCalls()).toHaveLength(2);
		expect(JSON.parse(putCalls()[1].input.logEvents[0].message).msg).toBe('kept');
	});

	it('creates the stream again when it was deleted', async () => {
		let puts = 0;
		send.mockImplementation(async (command) => {
			if (command instanceof PutLogEventsCommand && ++puts === 1) {
				throw awsError('ResourceNotFoundException');
			}
			return {};
		});

		const stream = create();
		stream.write({ msg: 'a' });
		await stream.flush();
		stream.write({ msg: 'b' });
		await stream.flush();

		const streams = send.mock.calls.filter(([c]) => c instanceof CreateLogStreamCommand);
		expect(streams).toHaveLength(2);
	});

	it('stops after reporting missing AWS credentials once', async () => {
		send.mockRejectedValue(awsError('CredentialsProviderError'));

		const stream = create();
		stream.write({ msg: 'a' });
		await stream.flush();
		stream.write({ msg: 'b' });
		await stream.flush();

		expect(onError).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledTimes(1);

		// every stream of that client stops too, without another report
		const other = create();
		other.write({ msg: 'c' });
		await other.flush();

		expect(onError).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledTimes(1);
	});

	it('flushes when the stream ends', async () => {
		const stream = create();
		stream.write({ msg: 'last words' });

		await new Promise<void>((resolve) => stream.end(resolve));

		expect(putCalls()).toHaveLength(1);
	});
});
