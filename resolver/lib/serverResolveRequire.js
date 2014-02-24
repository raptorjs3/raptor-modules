require('raptor-ecma/es6');
var ok = require('assert').ok;
var fs = require('fs');
var nodePath = require('path');
var searchPath = require('./search-path');
var moduleUtil = require('../../util');

function serverResolveRequire(target, from) {
    ok(target, '"target" is required');
    ok(typeof target === 'string', '"target" must be a string');
    ok(from, '"from" is required');
    ok(typeof from === 'string', '"from" must be a string');

    if (target.charAt(0) === '/' || target.indexOf(':\\') !== -1) {
        // Assume absolute paths have already been resolved...
        // Newer versions of Node.js will have a better test for isAbsolute()
        return target;
    }
    
    return searchPath.find(target, from, function(path) {

        var dirname = nodePath.dirname(path);
        if (nodePath.basename(dirname) !== 'node_modules' && moduleUtil.isDirCached(dirname)) {
            // Try with the extensions
            var extensions = require.extensions;
            for (var ext in extensions) {
                if (extensions.hasOwnProperty(ext)) {
                    var pathWithExt = path + ext;
                    if (moduleUtil.isDirCached(nodePath.dirname()) && fs.existsSync(pathWithExt)) {
                        return pathWithExt;
                    }
                }
            }
        }

        if (fs.existsSync(path)) {
            return path;
        }

        return null;
    });
}

module.exports = serverResolveRequire;