
var proxy = require('./lib/proxy');

var server = proxy.createServer('jamfor.upplandsvasby.se');

server.listen(1337);