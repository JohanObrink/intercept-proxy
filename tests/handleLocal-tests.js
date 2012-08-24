var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

describe('handleLocal', function() {

  var handleLocal;

  beforeEach(function() {
    
    handleLocal = require('../lib/handleLocal');
  
  });
  
  describe('#resolve', function() {
    
    it('should resolve the path correctly', function() {
      
      var root = path.resolve('./local');
      var req = { url: '/foo/bar/baz.aspx' };
      expect(handleLocal.resolve(req)).to.equal(root + '/foo/bar/baz.aspx');
    
    });
  
  });

  describe('local file', function() {

    var dirPath, filePath;

    var data = '<html><head><title>Hej</title></head><body><h1>Hello</h1><p>World!</p></body></html>';
    
    beforeEach(function(done) {
      
      dirPath = path.resolve('./local/test/');

      fs.mkdir(path.resolve('./local'), function(err) {
        if(err)
          throw err;

        fs.mkdir(dirPath, function(err) {
          if(err)
            throw err;

          filePath = path.resolve(dirPath + '/search.aspx');
          fs.writeFile(filePath, data, function(err) {
            if(err)
              throw err;

            done();

          });

        });

      });
      
    
    });

    afterEach(function(done) {
      
      fs.unlink(filePath, function() {
        fs.rmdir(dirPath, function() {
          fs.rmdir(path.resolve('./local'), function() {
            done();
          });
        });
      });
    
    });

    describe('#findAndRead', function() {

      var onHeaders = function() {};
      var onData = function() {};
      var onEnd = function() {};
      
      it('should return true if file exists', function() {
      
        expect(handleLocal.findAndRead(filePath, onHeaders, onData, onEnd)).to.be.true;
      
      });

      it('should return false if file does not exist', function() {
        
        expect(handleLocal.findAndRead(filePath + 'xx', onHeaders, onData, onEnd)).to.be.false;
      
      });

      it('should read the contents of an existing file', function(done) {
        
        var result = '';
        handleLocal.findAndRead(filePath, onHeaders, function(chunk) {
          result += chunk;
        }, function(chunk) {
          if(chunk)
            result += chunk;
          expect(result).to.equal(data);
          done();
        });
      
      });
    
    });

    describe('#pipe', function() {

      var res;

      beforeEach(function() {
        
        res = {
            status: 0,
            headers: null,
            data: '',
            _onEnd: null,
            onEnd: function(callback) {
              this._onEnd = callback;
            },
            writeHead: function(status, headers) {
              this.status = status;
              this.headers = headers;
            },
            write: function(chunk) {
              this.data += chunk;
            },
            end: function() {
              if(arguments.length)
                this.data += arguments[0];

              this._onEnd();
            }
          };
      });
      
      it('should pipe content to response', function(done) {
        
        var req = { url: '/test/search.aspx' };
        res.onEnd(function() {
          expect(res.status).to.equal(200);
          expect(res.data).to.equal(data);
          expect(res.headers).to.not.exist;
          done();
        });

        handleLocal.pipe(req, res);
      });

      describe('content.json', function() {

        var headersFilePath;
        var headers = {
          "Cache-Control": "private",
          "Content-Encoding": "deflate",
          "Content-Type": "text/html; charset=utf-8",
          "Date": "Thu, 23 Aug 2012 12:47:34 GMT",
          "Server": "Microsoft-IIS/7.0",
          "Vary": "Accept-Encoding",
          "X-AspNet-Version": "4.0.30319",
          "X-UA-Compatible": "IE=edge"
        };

        beforeEach(function(done) {
          
          headersFilePath = path.resolve(dirPath + '/headers.json');
          fs.writeFile(headersFilePath, JSON.stringify(headers), function(err) {
            if(err)
              throw err;
            done();
          });
        
        });

        afterEach(function(done) {
          
          fs.unlink(headersFilePath, function() {
            done();
          });
        
        });

        it('should write headers.json into headers', function(done) {
          
          var req = { url: '/test/search.aspx' };
          res.onEnd(function() {
            expect(res.status).to.equal(200);
            expect(res.data).to.equal(data);
            expect(res.headers).to.eql(headers);

            done();
          });

          handleLocal.pipe(req, res);
        });

      });
    
    });
  
  });

});