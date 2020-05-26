import {doc, isStr, makeEl} from './helpers'
import {Wrapper} from './wrapper'

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
export function mount(elementOrId, cls, props, parent, seq) {
  let view = createView(cls, props, parent, seq)
  let nodeToReplace = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)) : elementOrId
  nodeToReplace.parentNode.replaceChild(view.e, nodeToReplace)
  return view
}

/**
 * Creates a view, builds its DOM, and updates it.
 *
 * @param {class} cls The class of View to create
 * @param {object} parent The parent view (optional)
 * @param {object} props The props to pass to the view (optional)
 * @param {int} seq The sequence (optional)
 */
export function createView(cls, props, parent, seq) {
  let view = new cls(parent, props, seq)
  view.__bv(view, cls.prototype)
  view.init()
  view.update()
  return view
}

/**
 * Creates a wrapper from an HTML string.
 */
export function wrap(html) {
  return new Wrapper(makeEl(html))
}

/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */
export function h(tag, inner) {
  return new Wrapper(doc.createElement(tag)).inner(inner)
}
