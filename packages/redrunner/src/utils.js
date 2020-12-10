import {doc, isStr, makeEl} from './helpers'
import {Wrapper} from './wrapper'

/**
 * Creates and mounts a view onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of View to create
 * @param {object} props The props to pass to the view (optional)
 * @param {object} parent The parent view (optional)
 */
export function mount(elementOrId, cls, props, parent) {
  const view = createView(cls, parent, props)
  const nodeToReplace = isStr(elementOrId) ? doc.getElementById(elementOrId) : elementOrId
  nodeToReplace.parentNode.replaceChild(view.e, nodeToReplace)
  return view
}

/**
 * Creates a view and initialises it.
 *
 * @param {class} cls The class of View to create
 * @param {object} parent The parent view (optional)
 * @param {object} props The props to pass to the view (optional)
 */
export function createView(cls, parent, props) {
  const view = buildView(cls, parent)
  view.props = props
  view.init()
  view.update()
  return view
}

/**
 * Builds a view.
 */
export function buildView(cls, parent) {
  const view = new cls(parent)
  view.__bv(view, cls.prototype)
  return view
}


/**
 * Creates a wrapper of type tag e.g. h('div')
 */
export function h(tag) {
  return new Wrapper(doc.createElement(tag))
}
