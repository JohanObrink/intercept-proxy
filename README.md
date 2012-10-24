#Intercept Proxy [![Build Status](https://secure.travis-ci.org/JohanObrink/intercept-proxy.png?branch=master)](http://travis-ci.org/JohanObrink/intercept-proxy)
-
A lite-weight proxy for exposing a remote site through localhost and replace select resources with local versions for testing and development purposes.

##Install

    npm install intercept-proxy

##CLI
To use command line, you must first install package with

    npm install -g intercept-proxy

This is just done once. Then you can call:

    intercept-proxy myremote -h myremotesite.com -p 3000
    cd myremote
    npm install
    npm start

...and the site will runat http://localhost:3000 and point to myremotesite.com

##Usage
By pointing the proxy server at a url and running the app, you can surf the targeted site through localhost:

    var proxy = require('intercept-proxy');
    var server = proxy.createServer('knowyourmeme.com');
    server.listen(1337, function() {
      console.log('Proxy: ' + server.host + ' listening on http://localhost:' + server.port);
    });

or with more options:

    proxy.createServer({
      host: 'knowyourmeme.com',
      methods: 'GET,POST',           // will intercept GET and POST but not PUT and DELETE
      supressQuery: true             // remove query parameters from url when looking for local file
    });

##Intercepting with locals
By adding files to /local/[path], those files will replace the ones from the original site. Only GET requests will be intercepted by default.

    /js/main.js can be replaced by creating /local/js/main.js

##Intercepting with handlers
Calls can also be intercepted using handlers. A handler can be registered with just path or path and verbs

    // register handler which responds to all calls to /foo/bar
    proxy.addHandler('/foo/bar', function(req, res) {
      res.end('foo');
    });

    //register handler which responds to POSTs and PUTs to /foo/bar
    proxy.addHandler('/foo/bar', 'POST,PUT', function(req, res) {
      res.end('foo');
    });

    //remove handler for all verbs in requests for /foo/bar
    proxy.removeHandler('/foo/bar');

    //remove handler for GET and DELETE in requests for /foo/bar
    proxy.removeHandler('/foo/bar', 'GET,DELETE');

##Why?
Beacuse I needed it for a project :)