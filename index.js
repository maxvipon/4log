'use strict';

const datef = require('datef');
const ff = require('pff');

const TYPES = {
	msg: 'MSG',
	err: 'ERR',
	res: 'RES'
};

function rec(item) {
	return item || '-';
}

function toLine(msg) {
	return msg
		.replace(/\n$/, '')
		.replace(/"/gm, '\'')
		.replace(/\n/gm, ' >> ');
}

function Logger(name, outStream, errStream) {
	this.name = name;
	this.tsformat = 'dd/MM/YYYY:hh:mm:ss ZZ';
	this.stdout = outStream || process.stdout;
	this.stderr = errStream || process.stderr;
}

Logger.prototype._prepareMsgRecord = function prepareMsgRecord(args) {
	return {
		msg: ff.apply(null, args)
	};
};

Logger.prototype._prepareErrRecord = function prepareErrRecord(args) {
	const err = args.shift();
	const isError = err instanceof Error;
	const errMsg = isError ? toLine(err.reason || err.message) : err;

	let msg;
	let stack;

	switch (err.name) {
		case 'HTTPError':
			msg = `${err.method} ${err.host}${err.path} ${err.statusCode}`;
			break;
		case 'RequestError':
		case 'ReadError':
			msg = `${err.method} ${err.host}${err.path} ${err.code}`;
			break;
		default:
			msg = errMsg;
			stack = err.stack;
	}

	stack = stack ? toLine(stack) : '-';

	return {
		msg: msg,
		stack: stack
	};
};

Logger.prototype._prepareResRecord = function prepareResRecord(args) {
	const res = args.shift();
	const req = res.req;
	const err = args[0];

	let msg;

	if (err instanceof Error) {
		msg = err.reason || err.message;
	} else if (typeof err === 'string') {
		msg = err;
	} else {
		msg = '-';
	}

	return {
		msg: msg,
		ip: req.ip,
		method: req.method,
		url: req.url,
		status: res.statusCode,
		requestId: req.headers['x-request-id']
	};
};

Logger.prototype._prepareRecord = function prepareRecord(type, args) {
	const prepare = {
		msg: this._prepareMsgRecord,
		err: this._prepareErrRecord,
		res: this._prepareResRecord
	}[type];

	const record = prepare(args);

	record.ts = datef(this.tsformat);
	record.pid = process.pid;
	record.type = TYPES[type];
	record.who = this.name;

	return record;
};

Logger.prototype._formatMsg = function formatMsg(record) {
	// Format: [ts] [pid] type who "message"
	return `[${record.ts}] [${record.pid}] ${record.type} ${record.who} "${record.msg}"`;
};

Logger.prototype._formatErr = function formatErr(record) {
	// Format: [ts] [pid] type who "message" "stack"
	return `[${record.ts}] [${record.pid}] ${record.type} ${record.who} "${record.msg}" "${record.stack}"`;
};

Logger.prototype._formatRes = function formatRes(record) {
	// Format: [ts] [pid] type who IP "method url" status "message" "request_id"
	return `[${record.ts}] [${record.pid}] ${record.type} ${record.who} ${rec(record.ip)} "${record.method} ${record.url}" ${record.status} "${record.msg}" "${record.requestId}"`;
};

Logger.prototype._format = function formatRecord(type, record) {
	const format = {
		msg: this._formatMsg,
		err: this._formatErr,
		res: this._formatRes
	}[type];

	return format(record) + '\n';
};

Logger.prototype._flush = function flush(type, record) {
	let out = this.stdout;

	if (type === 'err') {
		out = this.stderr;
	}

	const formatted = this._format(type, record);
	out.write(formatted);
};

['msg', 'err', 'res'].forEach(method => {
	Logger.prototype[method] = function () {
		const args = Array.prototype.slice.call(arguments);
		const record = this._prepareRecord(method, args);

		this._flush(method, record);
	};
});

module.exports = (name, out, err) => {
	return new Logger(name, out, err);
};
