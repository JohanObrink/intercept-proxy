/*global exports */

var fs = require('fs');
var path = require('path');

var resolve = exports.resolve = function(req) {
  return path.resolve('./local' + req.url);
};

var findAndRead = exports.findAndRead = function(filePath, onHeaders, onData, onEnd) {
  var stat = fs.statSync(filePath);
  if(!stat || !stat.isFile()) {
    return false;
  }

  getHeaders(filePath, function(status, headers) {

    onHeaders(status, headers);

    var readStream = fs.createReadStream(filePath);
    readStream.on('data', onData);
    readStream.on('end', onEnd);

  });

  return true;
};

var getHeaders = exports.getHeaders = function(filePath, callback) {
  var jsonPath = path.join(path.dirname(filePath), 'headers.json');
  if(!fs.existsSync(jsonPath)) {
    callback(200);
  } else {
    fs.readFile(jsonPath, function(err, data) {
      callback(200, JSON.parse(data));
    });
  }
};

var pipe = exports.pipe = function(req, res) {

  return findAndRead(resolve(req), function(status, headers) {

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