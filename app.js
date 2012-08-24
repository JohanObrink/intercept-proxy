
var proxy = require('./lib/proxy');

var server = proxy.createServer('knowyourmeme.com');

server.listen(1337);