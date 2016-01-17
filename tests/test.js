'use strict';

var validate = require('./../index');
var expect = require('chai').expect;
var Joi = require('joi');

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

var schema = Joi.object().keys({
    id: Joi.string().strip().label('id'),
    applicationId: Joi.string().strip().label('applicationId'),
    name: Joi.string().required().label('name'),
    description: Joi.string().optional().label('description'),
    meta: Joi.object().optional().default({}).options({
        allowUnknown: true
    }).keys({
        created: Joi.number().integer().strip().label('/meta/created')
    }).label('meta')
}).options({
    allowUnknown: false
}).label('patch object');

var origObj = {
    id: 'c1234',
    name: 'Shark',
    meta: {
        created: 1452474481612,
        tmp: 10,
        desc: 'my meta description',
        array: ["apple", "orange", "pear", "lemon"]
    }
};

describe('JSON Patch Validation', function() {
    it('should successfully add a top-level description field', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'add',
            path: '/description',
            value: 'A red shark'
        }];

        validate(obj, schema, patch);
    });

    it('should successfully remove an element from /meta/array/0', function() {
        var obj = clone(origObj);

        var patch = [{
            "op": "remove",
            "path": "/meta/array/0"
        }];

        validate(obj, schema, patch);
    });

    it('should successfully remove an element from /meta/array/2', function() {
        var obj = clone(origObj);

        var patch = [{
            "op": "remove",
            "path": "/meta/array/2"
        }];

        validate(obj, schema, patch);
    });

    it('should fail to replace the top-level id field', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'replace',
            path: '/id',
            value: 'foo'
        }];

        var fn = function() {
            validate(obj, schema, patch);
        };

        expect(fn).to.throw(/illegal/g);
    });

    it('should fail to remove /meta/created', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'remove',
            path: '/meta/created'
        }];

        var fn = function() {
            validate(obj, schema, patch);
        };

        expect(fn).to.throw(/deleted/g);
    });

    it('should fail to copy from /meta/tmp to /meta/created', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'copy',
            path: '/meta/created',
            from: '/meta/tmp'
        }];

        var fn = function() {
            validate(obj, schema, patch);
        };

        expect(fn).to.throw(/illegal/g);
    });

    it('should fail to move from /meta/tmp to /meta/created', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'move',
            path: '/meta/created',
            from: '/meta/tmp'
        }];

        var fn = function() {
            validate(obj, schema, patch);
        };

        expect(fn).to.throw(/illegal/g);
    });

    it('should fail to patch even when field does not change - set /meta/created to 1452474481612', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'replace',
            path: '/meta/created',
            value: 1452474481612
        }];

        var fn = function() {
            validate(obj, schema, patch);
        };

        expect(fn).to.throw(/illegal/g);
    });

    it('should fail to move /meta/desc to /id', function() {
        var obj = clone(origObj);

        var patch = [{
            op: 'move',
            path: '/id',
            from: '/meta/desc'
        }];

        var fn = function() {
            validate(obj, schema, patch);
        };

        expect(fn).to.throw(/illegal/g);
    });
});

describe('JSON Patch "test" Operation', function() {
    // {
    //     op: 'test',
    //     path: '/meta/created',
    //     value: 1452474481612
    // },
});
