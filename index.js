'use strict';
/* eslint no-console: 0 */

/*
 * Validating JSON Patch Requests
 *
 * This is an implementation that aims to validate JSON Patch requests.
 */

var _ = require('lodash');
var jsonpatch = require('fast-json-patch');
var Joi = require('joi');

module.exports = function validate(origObj, schema, patch) {
    // removes protected fields from the provided object
    // @returns: the cleaned object
    function cleanObj(obj) {
        return Joi.validate(obj, schema).value; // we only care about the validated object
    }

    // iterationObj will be continually modified by each of the patches
    var iterationObj = _.cloneDeep(origObj);

    for(var index = 0; index < patch.length; index++) {
        var p = patch[index];

        // keep a copy before this round of patching so we can clean and compare it later
        var cleanedUnpatchedObj = cleanObj(_.cloneDeep(iterationObj));
        jsonpatch.apply(iterationObj, [p]); // TODO use patchResult for failed patch feedback

        // clean a copy of the iterationObj
        var cleanedPatchedObj = cleanObj(_.cloneDeep(iterationObj));

        // Now patch the object that was:
        // * cleaned (not patched this iteration)
        //
        // It should match the object that was:
        // * patched and
        // * cleaned
        var patchedCleanedObj = _.cloneDeep(cleanedUnpatchedObj);
        jsonpatch.apply(patchedCleanedObj, [p]);

        // Delete case:
        // (clean obj) and (clean obj and apply patch) should be different
        var deleteComparisonDiff = jsonpatch.compare(cleanedUnpatchedObj, patchedCleanedObj);
        var patchHadNoEffect = (deleteComparisonDiff.length === 0);
        if (patchHadNoEffect) {
            if (p.op === 'remove') {
                throw new Error('deleted protected field or patch had no effect (TODO)');
            } else {
                console.warn('Patch ' + JSON.stringify(p) + ' had no effect');
            }
        }

        // compare the two cleaned objects
        var comparisonDiff = jsonpatch.compare(patchedCleanedObj, cleanedPatchedObj);

        if (comparisonDiff.length > 0) {
            throw new Error('Patch ' + JSON.stringify(p) + ' is illegal');
        }
    }

};
