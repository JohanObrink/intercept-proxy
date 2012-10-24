var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');
var os = require('os');
var exec = require('child_process').exec;

// On windows, unlink does not work as expected - using exec on DOS del instead
var deleteFile = function(path, callback) {
  ('win32' == os.platform())
    ? exec('del ' + path, callback)
    : fs.unlink(path, callback);
}

// existsSync moved from path to fs in v. 8
var existsSync = fs.existsSync || path.existsSync;

describe('handleLocal', function() {

  var handleLocal;

  beforeEach(function() {
    
    handleLocal = require('../lib/handleLocal');
  
  });
  
  describe('#resolve', function() {
    
    it('should resolve the path correctly', function() {
      var req = { url: '/foo/bar/baz.aspx', method: 'GET' };
      expect(handleLocal.resolve(req)).to.equal(path.resolve('./local/foo/bar/baz.aspx'));
    
    });

    it('should include query params in path by default', function() {
      var req = { url: '/foo/bar/baz.aspx?plupp=derp', method: 'GET' };
      expect(handleLocal.resolve(req)).to.equal(path.resolve('./local/foo/bar/baz.aspx?plupp=derp'));
    
    });

    it('should remove query params in path by option', function() {
      var req = { url: '/foo/bar/baz.aspx?plupp=derp', method: 'GET' };
      expect(handleLocal.resolve(req, { supressQuery: false })).to.equal(path.resolve('./local/foo/bar/baz.aspx?plupp=derp'));
    
    });

    it('should keep query params in path by option', function() {
      var req = { url: '/foo/bar/baz.aspx?plupp=derp', method: 'GET' };
      expect(handleLocal.resolve(req, { supressQuery: true })).to.equal(path.resolve('./local/foo/bar/baz.aspx'));
    
    });

    it('should resolve path correctly with hash', function() {
      var req = { url: '/foo/bar/baz.aspx#plupp=derp', method: 'GET' };
      expect(handleLocal.resolve(req)).to.equal(path.resolve('./local/foo/bar/baz.aspx'));
    
    });
  
  });

  describe('local file', function() {

    var localPath, testPath, filePath;

    var data = '<html><head><title>Hej</title></head><body><h1>Hello</h1><p>World!</p></body></html>';
    
    beforeEach(function() {
      localPath = path.resolve('./local/');
      testPath = path.resolve('./local/test/');
      filePath = path.resolve(testPath + '/search.aspx');

      wrench.mkdirSyncRecursive(testPath, 0777);
      fs.writeFileSync(filePath, data);
    });

    afterEach(function(done) {
      deleteFile(filePath, function() {
        wrench.rmdirSyncRecursive(localPath, true);
        done();
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

              this._onEnd && this._onEnd();
            }
          };
      });

      it('should return false if method is POST', function() {
        
        var req = { url: '/test/search.aspx', method: 'POST' };
        expect(handleLocal.pipe(req)).to.be.false;
      
      });

      it('should return true if method is POST and options.methods includes POST', function() {
        
        var req = { url: '/test/search.aspx', method: 'POST' };
        expect(handleLocal.pipe(req, res, { methods: 'GET,POST,PUT' })).to.be.true;
      
      });
      
      it('should pipe content to response', function(done) {
        
        var req = { url: '/test/search.aspx', method: 'GET' };
        res.onEnd(function() {
          expect(res.status).to.equal(200);
          expect(res.data).to.equal(data);
          expect(res.headers).to.eql({ "Content-Type": "text/html; charset=utf-8" });
          done();
        });

        handleLocal.pipe(req, res);
      });

      describe('headers by extension', function() {
        it('should set correct headers by extension', function(done) {
        
          var req = { url: '/test/search.aspx', method: 'GET' };
          res.onEnd(function() {
            expect(res.status).to.equal(200);
            expect(res.data).to.equal(data);
            expect(res.headers).to.eql({ "Content-Type": "text/html; charset=utf-8" });

            done();
          });

          handleLocal.pipe(req, res);
        });
      });

      describe('headers.json', function() {

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
          
          headersFilePath = path.resolve(testPath + '/headers.json');
          fs.writeFile(headersFilePath, JSON.stringify(headers), function(err) {
            if(err)
              throw err;
            done();
          });
        
        });

        afterEach(function(done) {
          
          deleteFile(headersFilePath, function() {
            done();
          });
        
        });

        it('should write headers.json into headers', function(done) {
          
          var req = { url: '/test/search.aspx', method: 'GET' };
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