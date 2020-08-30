import express = require('express');

function index(req: express.Request, res: express.Response) {
	res.send('Online');
}

export default index;
