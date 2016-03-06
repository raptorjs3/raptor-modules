'use strict';
require('../'); // Load the module
var nodePath = require('path');
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var fs = require('fs');

require('../'); // Load this module just to make sure it works

describe('raptor-modules/transport.defineCode' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }
        done();
    });

    it('should handle String argument for factory function code', function(done) {
        var transport = require('../');
        var out = transport.defineCode('/some/path', 'exports.test=true;');
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { exports.test=true;\n});');
            done();
        });

        out.resume();
    });

    it('should handle String argument for object code', function(done) {
        var transport = require('../');
        var out = transport.defineCode('/some/path', '{ "hello": "world" }', {object: true});
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.def("/some/path", { "hello": "world" });');
            done();
        });

        out.resume();
    });

    it('should handle Stream argument for factory function code', function(done) {
        var transport = require('../');
        var stream = fs.createReadStream(nodePath.join(__dirname, 'test.js'), {encoding: 'utf8'});
        var out = transport.defineCode('/some/path', stream);
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { exports.test=true;\n});');
            done();
        });

        out.resume();
    });

    it('should handle run code for some path', function(done) {
        var transport = require('../');
        var out = transport.runCode('/some/path');
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.run("/some/path");');
            done();
        });

        out.resume();
    });

    it('should handle Stream argument for object code', function(done) {
        var transport = require('../');
        var stream = fs.createReadStream(nodePath.join(__dirname, 'test.json'), {encoding: 'utf8'});
        var out = transport.defineCode('/some/path', stream, {object: true});
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.def("/some/path", { "hello": "world" });');
            done();
        });

        out.resume();
    });

    it('should support "globalName" option', function(done) {
        var transport = require('../');
        var out = transport.defineCode('/some/path', 'exports.test=true;', {globals: ['$']});
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { exports.test=true;\n},{"globals":["$"]});');
            done();
        });

        out.resume();
    });

    it('should allow additional vars (no "use strict")', function() {
        var transport = require('../');
        var code = transport.defineCode.sync('/some/path', 'exports.test=true;', {
            additionalVars: [
                'foo="bar"'
            ]
        });

        expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { var foo="bar"; exports.test=true;\n});');
    });

    it('should allow additional vars ("use strict";)', function() {
        var transport = require('../');
        var code = transport.defineCode.sync('/some/path', '"use strict";\nexports.test=true;', {
            additionalVars: [
                'foo="bar"'
            ]
        });

        expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { "use strict";var foo="bar"; \nexports.test=true;\n});');
    });

    it('should allow additional vars (\'use strict\';)', function() {
        var transport = require('../');
        var code = transport.defineCode.sync('/some/path', '\'use strict\';\nexports.test=true;', {
            additionalVars: [
                'foo="bar"'
            ]
        });

        expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { \'use strict\';var foo="bar"; \nexports.test=true;\n});');
    });

    it('should allow additional vars ("use strict", no semicolon)', function() {
        var transport = require('../');
        var code = transport.defineCode.sync('/some/path', '"use strict" \nexports.test=true;', {
            additionalVars: [
                'foo="bar"'
            ]
        });

        expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { "use strict" \nvar foo="bar"; exports.test=true;\n});');
    });

    it('should allow additional vars ("use strict", after multiline comment)', function() {
        var transport = require('../');
        var code = transport.defineCode.sync('/some/path', '/* hello world */\n/*more comments*/\n// Test comment\n   \n"use strict" \nexports.test=true;', {
            additionalVars: [
                'foo="bar"'
            ]
        });

        expect(code).to.equal('$rmod.def("/some/path", function(require, exports, module, __filename, __dirname) { /* hello world */\n/*more comments*/\n// Test comment\n   \n"use strict" \nvar foo=\"bar\"; exports.test=true;\n});');
    });

});

