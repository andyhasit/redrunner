"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeEl = makeEl;
exports.isStr = exports.und = exports.doc = void 0;
var c = console;
var doc = document;
exports.doc = doc;
var throwAway = doc.createElement('template');
/**
 * Create an element from html string
 */

function makeEl(html) {
  throwAway.innerHTML = html;
  return throwAway.content.firstChild;
}
/**
 * Some utility functions
 */


var und = function und(x) {
  return x === undefined;
};

exports.und = und;

var isStr = function isStr(x) {
  return typeof x === 'string';
};

exports.isStr = isStr;