"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mount = mount;
exports.createView = createView;
exports.wrap = wrap;
exports.h = h;

var _helpers = require("./helpers");

var _wrapper = require("./wrapper");

/**
 * Creates and mounts a view onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an
 *     element.
 * @param {class} cls The class of View to create
 * @param {object} props The props to pass to the view (optional)
 * @param {object} parent The parent view (optional)
 * @param {int} seq The sequence (optional)
 */
function mount(elementOrId, cls, props, parent, seq) {
  var view = createView(cls, props, parent, seq);
  var nodeToReplace = (0, _helpers.isStr)(elementOrId) ? _helpers.doc.getElementById(elementOrId.slice(1)) : elementOrId;
  nodeToReplace.parentNode.replaceChild(view.root.e, nodeToReplace);
  return view;
}
/**
 * Creates a view, builds its DOM, and updates it.
 *
 * @param {class} cls The class of View to create
 * @param {object} parent The parent view (optional)
 * @param {object} props The props to pass to the view (optional)
 * @param {int} seq The sequence (optional)
 */


function createView(cls, props, parent, seq) {
  var view = new cls(parent, props, seq);

  view.__bv(view, cls.prototype);

  view.init();
  view.update();
  return view;
}
/**
 * Creates a wrapper from an HTML string.
 */


function wrap(html) {
  return new _wrapper.Wrapper((0, _helpers.makeEl)(html));
}
/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */


function h(tag, inner) {
  return new _wrapper.Wrapper(_helpers.doc.createElement(tag)).inner(inner);
}