# 4log [![Build Status](https://travis-ci.org/maxvipon/4log.svg?branch=master)](https://travis-ci.org/maxvipon/4log)

> Line, HTTP Response and Error logger


## Install

```
$ npm install --save 4log
```


## Usage

```js
const log = require('4log')('ctrl:index');

log.msg('unicorns');
// Format: [datetime] [pid] type who "message"
// => [12/Sep/2016:11:56:51 +0500] [74640] MSG ctrl:index "unicorns"

log.err(new Error('foobar'));
// Format: [datetime] [pid] type who "message" "stack"
// => [12/Sep/2016:09:53:28 +0300] [74640] ERR ctrl:index "ERROR:  index returned tuples in wrong order" "Error: ERROR:  index returned tuples in wrong order >>  >>     at Client._readError (/node_modules/pg-native/index.js:80:13) >>     at Client._read (/node_modules/pg-native/index.js:121:19) >>     at PQ.emit (events.js:104:17)"

log.res(res);
// format: [datetime] [pid] type who IP "method url" status "message" "request_id"
// => [12/Sep/2016:11:34:00 +0300] [74640] RES ctrl:index 2a02:6b8:0:1625::6 "GET /v1/locations/foobar" 404 "Unsupported location" "7b5f10be25e111b2483f2b7e856feeac"
```


## API

### log(name[, outStream[, errStream]])

#### name

Type: `String`

Name of the Logger instance.

#### outStream

Type: `Stream`<br>
Default: `stdout`

Writable stream for MSG and RES logs.

#### errStream

Type: `Stream`<br>
Default: `stderr`

Writable stream for ERR logs.

### log.msg(str[, arg1[, arg2,[ … argN]]])

#### str

Type: `String`

Sting for log. It may contain formatters `%s` or `%d` similar to `console.log`

### log.err(err)

#### err

Type: `Error`

### log.res(res[, err])

#### res

Type: `Response`

Express Response.

#### err

Type: `Error`

Error for logging response error.

## License

MIT © [Maxim Ponomarev](https://github.com/maxvipon)
