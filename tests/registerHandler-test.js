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

      expect(server.handlers['/foo']['GET']).to.equal(handler);
      expect(server.handlers['/foo']['POST']).to.equal(handler);
      expect(server.handlers['/foo']['PUT']).to.equal(handler);
      expect(server.handlers['/foo']['DELETE']).to.equal(handler);
      expect(server.handlers['/foo']['PATCH']).to.equal(handler);
    });

    it('should remove a reference to a simple handler', function() {

      var handler = function(req, res) {};

      server.addHandler('/foo', handler);
      expect(server.handlers['/foo']['GET']).to.equal(handler);

      server.removeHandler('/foo');
      expect(server.handlers['/foo']).to.be.undefined;
    });

    it('should save a reference to a handler+verb', function() {

      var handler = function(req, res) {};
      server.addHandler('/foo', 'POST', handler);

      expect(server.handlers['/foo']['POST']).to.equal(handler);
    });

    it('should remove a reference to a handler+verb', function() {

      var handler = function(req, res) {};

      server.addHandler('/foo', 'GET', handler);
      server.addHandler('/foo', 'POST', handler);

      expect(server.handlers['/foo']['GET']).to.equal(handler);
      expect(server.handlers['/foo']['POST']).to.equal(handler);

      server.removeHandler('/foo', 'POST');

      expect(server.handlers['/foo']['GET']).to.equal(handler);
      expect(server.handlers['/foo']['POST']).to.be.undefined;
    });

    it('should save a reference to a handler+verbs', function() {

      var handler = function(req, res) {};
      server.addHandler('/foo', 'GET,POST', handler);

      expect(server.handlers['/foo']['GET']).to.equal(handler);
      expect(server.handlers['/foo']['POST']).to.equal(handler);
      expect(server.handlers['/foo']['PUT']).to.be.undefined;
    });

    it('should remove a reference to a handler+verbs', function() {

      var handler = function(req, res) {};

      server.addHandler('/foo', 'GET,POST,PUT', handler);

      expect(server.handlers['/foo']['GET']).to.equal(handler);
      expect(server.handlers['/foo']['POST']).to.equal(handler);
      expect(server.handlers['/foo']['PUT']).to.equal(handler);
      expect(server.handlers['/foo']['DELETE']).to.be.undefined;

      server.removeHandler('/foo', 'GET,POST');

      expect(server.handlers['/foo']['GET']).to.be.undefined;
      expect(server.handlers['/foo']['POST']).to.be.undefined;
      expect(server.handlers['/foo']['PUT']).to.equal(handler);
    });

    describe('calls to handlers', function() {
      it('should call a handler for matching path', function(done) {

        var request = new http.IncomingMessage();
        request.url = '/foo';
        request.method = 'GET';

        server.addHandler('/foo', function(req, res) {
          expect(req).to.equal(request);
          done();
        });
        server.server.emit('request', request);

      });

      it('should call a handler for matching path+verb', function(done) {

        var request = new http.IncomingMessage();
        request.url = '/foo';
        request.method = 'POST';

        server.addHandler('/foo', 'POST', function(req, res) {
          expect(req).to.equal(request);
          done();
        });
        server.server.emit('request', request);

      });

      it('should not call handler for non matching verb', function(done) {

        var request = new http.IncomingMessage();
        request.url = '/foo';
        request.method = 'PATCH';

        server.addHandler('/foo', 'GET,POST,PUT,DELETE', function(req, res) {
          expect(false, 'handler should not be called for PATCH').to.be.true;
        });

        server.server.emit('request', request);
        setTimeout(done, 10);
      });
    });
  });

});