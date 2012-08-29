var htmlHeaders = { "Content-Type": "text/html; charset=utf-8" };
var jsHeaders = { "Content-Type": "text/javascript; charset=utf-8" };
var cssHeaders = { "Content-Type": "text/css; charset=utf-8" };
var jpegHeaders = { "Content-Type": "image/jpeg" };
var pngHeaders = { "Content-Type": "image/png" };
var gifHeaders = { "Content-Type": "image/gif" };

var getHeaders = exports.getHeaders = function(req) {



};

var getHeadersByExtension = exports.getHeadersByExtension = function(ext) {

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