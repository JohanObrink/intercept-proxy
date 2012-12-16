var expect = require('chai').expect,
	ProxyServer = require('../lib/proxy').ProxyServer;

describe('ProxyServer', function() {

	describe('#constructor', function() {

		it('should correct host for url only', function() {
			var proxy = new ProxyServer('www.mysite.com');

			expect(proxy.options.host).to.equal('www.mysite.com');
		});

		it('should set port 80 for url only', function() {
			var proxy = new ProxyServer('www.mysite.com');

			expect(proxy.options.port).to.equal(80);
		});

		it('should parse host for url with port', function() {
			var proxy = new ProxyServer('www.mysite.com:1337');

			expect(proxy.options.host).to.equal('www.mysite.com');
		});

		it('should parse port number for url with port', function() {
			var proxy = new ProxyServer('www.mysite.com:1337');

			expect(proxy.options.port).to.equal(1337);
		});

	});

});