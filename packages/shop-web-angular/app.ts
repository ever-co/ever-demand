import * as connect from 'connect';
import * as path from 'path';
import * as serveStatic from 'serve-static';
import { env } from './scripts/env';

const port: number = env.PORT;

connect()
	.use(serveStatic(path.join(__dirname, '../')))
	.listen(port);
console.log(`listening on ${port}`);
