# JSON Patch Validation

:exclamation: DEMO PURPOSES ONLY :exclamation:

> Validates JSON Patches ([RFC 6902](https://tools.ietf.org/html/rfc6902)). This repository is for demo/explaination purposes only. Please see [https://medium.com/p/44ca5981a7fc](this article) for a better approach to JSON Patch validation.

## Validation Strategy

This validation strategy works by patching the source object, stripping out protected/unmodifiable fields from both the patched object and the original object, and validating that the two objects contain the same data. This works because the fields that are not allowed to be modified are stripped out of the original and if any of the fields still exist in the patched and stripped object, that means that patch modified protected fields.

## What is this for?

This repository is an example of how JSON patch validation could be done using only object cloning, a patching function, and a comparison function.

This algorithm could be adapted for use with other languages to provide patch validation. If you are looking for a Node.js / JavaScript solution, you should look at [MarkHerhold/json-patch-joi](https://github.com/MarkHerhold/json-patch-joi) instead.

Please note that Joi is used in this example for the sole purpose of stripping out protected fields, which could be substituted by simply removing the protected fields (e.g. `delete obj.field`).
