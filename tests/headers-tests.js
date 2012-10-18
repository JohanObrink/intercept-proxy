var expect = require('chai').expect;
var headers = require('../lib/headers');

describe('headers', function() {

  var htmlHeaders = { "Content-Type": "text/html; charset=utf-8" };
  var cssHeaders = { "Content-Type": "text/css; charset=utf-8" };
  var jsHeaders = { "Content-Type": "text/javascript; charset=utf-8" };
  var jpegHeaders = { "Content-Type": "image/jpeg" };
  var pngHeaders = { "Content-Type": "image/png" };
  var gifHeaders = { "Content-Type": "image/gif" };
  
  describe('#getHeadersByExtension', function() {

    
    it('should resolve html for aspx', function() {
      expect(headers.getHeadersByExtension('.aspx')).to.eql(htmlHeaders);
    });
    it('should resolve html for html', function() {
      expect(headers.getHeadersByExtension('.html')).to.eql(htmlHeaders);
    });
    it('should resolve html for htm', function() {
      expect(headers.getHeadersByExtension('.htm')).to.eql(htmlHeaders);
    });
    it('should resolve html for php', function() {
      expect(headers.getHeadersByExtension('.php')).to.eql(htmlHeaders);
    });
    it('should resolve css for css', function() {
      expect(headers.getHeadersByExtension('.css')).to.eql(cssHeaders);
    });
    it('should resolve css for less', function() {
      expect(headers.getHeadersByExtension('.less')).to.eql(cssHeaders);
    });
    it('should resolve css for sass', function() {
      expect(headers.getHeadersByExtension('.sass')).to.eql(cssHeaders);
    });
    it('should resolve css for scss', function() {
      expect(headers.getHeadersByExtension('.scss')).to.eql(cssHeaders);
    });
    it('should resolve css for stylus', function() {
      expect(headers.getHeadersByExtension('.stylus')).to.eql(cssHeaders);
    });
    it('should resolve javascript for js', function() {
      expect(headers.getHeadersByExtension('.js')).to.eql(jsHeaders);
    });
    it('should resolve jpeg for jpeg', function() {
      expect(headers.getHeadersByExtension('.jpeg')).to.eql(jpegHeaders);
    });
    it('should resolve jpeg for jpg', function() {
      expect(headers.getHeadersByExtension('.jpg')).to.eql(jpegHeaders);
    });
    it('should resolve png for png', function() {
      expect(headers.getHeadersByExtension('.png')).to.eql(pngHeaders);
    });
    it('should resolve gif for gif', function() {
      expect(headers.getHeadersByExtension('.gif')).to.eql(gifHeaders);
    });
  
  });

  describe('#getHeaders', function() {

    var _getHeadersByExtension;

    beforeEach(function() {
      
      _getHeadersByExtension = headers.getHeadersByExtension;
    
    });

    afterEach(function() {
      
      headers.getHeadersByExtension = _getHeadersByExtension;
    
    });
    
    it('should detect the correct extension', function(done) {
      
      headers.getHeadersByExtension = function(ext) {
        expect(ext).to.equal('.aspx');
        done();
      };

      headers.getHeaders('/pages/search.aspx');
    
    });
  
  });

});