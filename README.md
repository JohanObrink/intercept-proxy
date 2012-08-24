#Intercept Proxy
A lite-weight proxy for exposing a remote site through localhost and replace select resources with local versions for testing and development purposes.

##Usage
By pointing the proxy server at a url and running the app, you can surf the targeted site through localhost:

    var proxy = require('intercept-proxy');
    proxy.createServer('google.com');
    proxy.listen(1337);

##Intercepting with locals
By adding files to /local/[path], those files will replace the onse from the original site.

##Intercepting with handlers (planned)
I plan to make intercepting available through custom handlers. The idea is that you register a handler and a pattern for which requests it should handle.

    proxy.registerHandler({ url: '/foo/bar', method: 'POST', payload: '<xml />' }, function(req, res) { res.end('foo'); });

##Why?
Beacuse I needed it for a project :)