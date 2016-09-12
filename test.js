const test = require('ava');
const logger = require('./');

const streamMock = {
	out: '',
	write: input => {
		streamMock.out = input;
	}
};

const log = logger('test', streamMock, streamMock);
log.tsformat = '-';

test.serial('log.msg', t => {
	log.msg('unicorns');
	t.is(streamMock.out, `[-] [${process.pid}] MSG test \"unicorns\"\n`);

	log.msg('%scorns', 'uni');
	t.is(streamMock.out, `[-] [${process.pid}] MSG test \"unicorns\"\n`);

	log.msg('%scorns x%d', 'uni', 2);
	t.is(streamMock.out, `[-] [${process.pid}] MSG test \"unicorns x2\"\n`);
});
