var expect = require('chai').expect,
  proxy = require('../lib/proxy'),
  http = require('http');

describe('handlers', function() {

  var server;

  beforeEach(function() {
    server = proxy.createServer('mysite.com');
  });

  describe('#registerHandler', function() {
    it('should save a reference to a simple handler', function() {

      var handler = function(req, res) {};
      server.addHandler('/foo', handler);

      expect(server.handlers['/foo']).to.equal(handler);
    });

    it('should remove a reference to a simple handler', function() {

      var handler = function(req, res) {};

      server.addHandler('/foo', handler);
      expect(server.handlers['/foo']).to.equal(handler);

      server.removeHandler('/foo', handler);
      expect(server.handlers['/foo']).to.be.undefined;
    });

    describe('calls to handlers', function() {
      it('should call a matching handler', function(done) {

        var request = new http.IncomingMessage();
        request.url = '/foo';

        server.addHandler('/foo', function(req, res) {
          expect(req).to.equal(request);
          done();
        });
        server.server.emit('request', request);

      });
    });
  });

});