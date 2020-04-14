import bunyan from 'bunyan';

export const loggerMock = bunyan.createLogger({
	name: 'testingLoggerMock',
	streams: [],
});
