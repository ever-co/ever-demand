import { connect } from 'connect';
import path from 'path';
import { serveStatic } from 'serve-static';
const port: number = 8080;
connect()
	.use(serveStatic(path.join(__dirname, 'www')))
	.listen(port);
console.log(`listening on ${port}`);
