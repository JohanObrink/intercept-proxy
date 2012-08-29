/*global exports */

var fs = require('fs');
var path = require('path');
var url = require('url');

// existsSync moved from path to fs in v. 8
var existsSync = fs.existsSync || path.existsSync;

/**
 * resolve
 * Resolves the local file path from the request
 *
 * @api public
 */
var resolve = exports.resolve = function(req, options) {
  var supressQuery = (options && !options.supressUrl);
  var _url = url.parse(req.url);
  var _path = _url.pathname;
  if(!supressQuery && _url.search) _path += _url.search;
  return path.resolve('./local' + _path);
};

/**
 * findAndRead
 * Checks if a local file with the specified path
 * If so, it returns true and reads the file, calling into onData and onEnd
 *
 * @api private
 */
var findAndRead = exports.findAndRead = function(filePath, onHeaders, onData, onEnd) {
  if(!existsSync(filePath) || !fs.statSync(filePath).isFile())
    return false;

  getHeaders(filePath, function(status, headers) {

    onHeaders(status, headers);

    var readStream = fs.createReadStream(filePath);
    readStream.on('data', onData);
    readStream.on('end', onEnd);

  });

  return true;
};

/**
 * getHeaders
 * Checks if headers.json is present in the folder and appends properties as headers
 *
 * @api private
 */
var getHeaders = exports.getHeaders = function(filePath, callback) {
  var jsonPath = path.join(path.dirname(filePath), 'headers.json');
  if(!existsSync(jsonPath)) {
    callback(200);
  } else {
    fs.readFile(jsonPath, function(err, data) {
      callback(200, JSON.parse(data));
    });
  }
};

/**
 * pipe
 * Checks to see if request should be overridden and, if so, pumps the content of the file into the response
 *
 * @api public
 */
var pipe = exports.pipe = function(req, res, options) {

  var methods = (options && options.methods ? options.methods : 'GET').split('|');

  return methods.indexOf(req.method) >= 0 && findAndRead(resolve(req, options), function(status, headers) {

    //write header
    (headers) ? res.writeHead(status, headers) : res.writeHead(status);

  }, function(chunk) {
    
    // write to response
    res.write(chunk);

  }, function(chunk) {
    
    // on end
    (chunk) ? res.end(chunk) : res.end();

  });
};
