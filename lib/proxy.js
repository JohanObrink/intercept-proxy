/*global require, exports */

var http = require('http');
var _ = require('underscore');
var util = require('util');
var handleLocal = require('./handleLocal');

/**
 * ProxyServer
 * Routes all connections to another address
 * Exceptions can be aded to serve content locally
 *
 * @api public
 */
var ProxyServer = exports.ProxyServer = function(options) {
  
  options = ('string' === typeof options) ? { host: options } : options || {};

  this.options = {
    host: options.host,
    port: options.port || 80,
    path: options.path || '',
    headers: options.headers || {},
    methods: 'GET',
    supressQuery: false
  };
  this.options.headers['user-agent'] = options.userAgent || this.options.headers['user-agent'];

  var _this = this;

  this.server = http.createServer(function(req, res) {
    if(!_this.handleWithLocal(req, res) && !_this.customHandler(req, res))
      _this.passThrough(req, res);
  });

};

/**
 * listen
 * start listening on a specific port
 *
 * @api public
 */
ProxyServer.prototype.listen = function(port, callback) {
  if(callback)
    this.server.listen(port, callback);
  else
    this.server.listen(port);
};

/**
 * handleWithLocal
 * if a file is found at local/[requested path], this handler will reply yes
 * and then pass the contents of that file as the response
 *
 * @api private
 */
ProxyServer.prototype.handleWithLocal = function(req, res) {
  return handleLocal.pipe(req, res, this.options);
};

/**
 * customHandler
 * enables registration for custom handler with path and header selectors
 *
 * @api private
 */
ProxyServer.prototype.customHandler = function(req, res) {
  return false;
};

/**
 * passThrough
 * passes the request to the registered remote server
 *
 * @api private
 */
ProxyServer.prototype.passThrough = function(req, res) {

  // make a copy of options
  var options = _.clone(this.options);
  options.headers = _.clone(this.options.headers);
  options.method = req.method;

  _.each(_.keys(req.headers), function(key) {
    if('Access-Control-Request-Method' === key)
      options.method = req.headers[key];
    else if('host' !== key)
      options.headers[key] = req.headers[key];
  });

  options.path += req.url;

  var request = http.request(options, function(response) {
    res.writeHead(response.statusCode, response.headers);

    response.on('data', function(chunk) {
      res.write(chunk);
    });

    response.on('end', function() {
      res.end();
    });

    response.on('close', function(err) {
      res.end(err);
    });
  });
  request.on('error', function(err) {
    res.end(util.inspect(err));
  });

  req.on('data', function(chunk) {
    request.write(chunk);
  });

  req.on('end', function() {
    request.end();
  });

  return true;
};


exports.createServer = function (options) {

  return new ProxyServer(options);

};