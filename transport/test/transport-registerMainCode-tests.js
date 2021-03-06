'use strict';
require('../'); // Load the module
var nodePath = require('path');
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var fs = require('fs');

require('../'); // Load this module just to make sure it works

describe('raptor-modules/transport.registerMainCode' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            delete require.cache[k];
        }
        done();
    });

    it('should generate correct code', function(done) {
        var transport = require('../');
        var out = transport.registerMainCode('/foo@1.0.0', 'lib/index');
        var code = '';
        out.on('data', function(data) {
            code += data;
        });
        out.on('end', function() {
            expect(code).to.equal('$rmod.main("/foo@1.0.0", "lib/index");');
            done();
        });

        out.resume();
    });
});
