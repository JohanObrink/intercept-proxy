#!/usr/bin/env node

/**
 * Module dependencies.
 */

var exec = require('child_process').exec
  , program = require('commander')
  , mkdirp = require('mkdirp')
  , pkg = require('../package.json')
  , version = pkg.version
  , os = require('os')
  , fs = require('fs');

// CLI

program
  .version(version)
  .option('-r, --remote', 'set remote url')
  .option('-p, --port', 'set port')
  .option('-f, --force', 'force on non-empty directory')
  .parse(process.argv);

// Path

var path = program.args.shift() || '.';

// end-of-line code

var eol = 'win32' == os.platform() ? '\r\n' : '\n'

// Remote site

program.remote = program.remote || 'knowyourmeme.com';

// Port

program.port = program.port || 1337;

/**
 * App template.
 */

var app = [
    ''
  , '/**'
  , ' * Module dependencies.'
  , ' */'
  , ''
  , 'var proxy = require(\'intercept-proxy\');'
  , ''
  , '/**'
  , ' * Proxy server.'
  , ' */'
  , 'var server = proxy.createServer(\'' + program.remote + '\');'
  , 'server.listen(' + program.port + ', function() {'
  , '	console.log(\'Proxy: \' + server.remote + \' listening on http://localhost:\' + server.port);'
  , '});'
].join(eol);



// Generate application

(function createApplication(path) {
  emptyDirectory(path, function(empty){
    if (empty || program.force) {
      createApplicationAt(path);
    } else {
      program.confirm('destination is not empty, continue? ', function(ok){
        if (ok) {
          process.stdin.destroy();
          createApplicationAt(path);
        } else {
          abort('aborting');
        }
      });
    }
  });
})(path);

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplicationAt(path) {
  console.log();
  process.on('exit', function(){
    console.log();
    console.log('   install dependencies:');
    console.log('     $ cd %s && npm install', path);
    console.log();
    console.log('   run the app:');
    console.log('     $ node app');
    console.log();
  });

  mkdir(path, function(){
    mkdir(path + '/local');

    // package.json
    var pkg = {
        'name': path
      , 'version': '0.0.1'
      , 'private': true
      , 'scripts': { start: 'node app' }
      , 'dependencies': {
        'intercept-proxy': version
      }
    }

    if (program.template) pkg.dependencies[program.template] = '*';

    write(path + '/package.json', JSON.stringify(pkg, null, 2));
    write(path + '/app.js', app);
  });
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path, fn) {
  fs.readdir(path, function(err, files){
    if (err && 'ENOENT' != err.code) throw err;
    fn(!files || !files.length);
  });
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str) {
  fs.writeFile(path, str);
  console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
  mkdirp(path, 0755, function(err){
    if (err) throw err;
    console.log('   \033[36mcreate\033[0m : ' + path);
    fn && fn();
  });
}

/**
 * Exit with the given `str`.
 *
 * @param {String} str
 */

function abort(str) {
  console.error(str);
  process.exit(1);
}