var path = require('path');
var url = require('url');

var htmlHeaders = { "Content-Type": "text/html; charset=utf-8" };
var jsHeaders = { "Content-Type": "text/javascript; charset=utf-8" };
var cssHeaders = { "Content-Type": "text/css; charset=utf-8" };
var jpegHeaders = { "Content-Type": "image/jpeg" };
var pngHeaders = { "Content-Type": "image/png" };
var gifHeaders = { "Content-Type": "image/gif" };

var getHeaders = function(filePath) {

  return this.getHeadersByExtension(path.extname(filePath));

};

var getHeadersByExtension = function(ext) {

  switch(ext) {
    case '.aspx':
    case '.html':
    case '.htm':
    case '.php':
      return htmlHeaders;
    case '.css':
    case '.less':
    case '.sass':
    case '.scss':
    case '.stylus':
      return cssHeaders;
    case '.js':
      return jsHeaders;
    case '.jpg':
    case '.jpeg':
      return jpegHeaders;
    case '.png':
      return pngHeaders;
    case '.gif':
      return gifHeaders;
    default:
      return {};
  }

};

module.exports = {
  getHeaders: getHeaders,
  getHeadersByExtension: getHeadersByExtension
};