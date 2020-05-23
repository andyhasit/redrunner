const c = console
const doc = document

/**
 * Some utility functions
 */
export const und = x => x === undefined
export const isStr = x => typeof x === 'string'

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
  nodeToReplace.parentNode.replaceChild(view.root.e, nodeToReplace)
  return view
}

/**
 * Creates a wrapper from an HTML string.
 */
export function wrap(html) {
  let throwAway = doc.createElement('template')
  throwAway.innerHTML = html
  return new Wrapper(throwAway.content.firstChild)
}

/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */
export function h(tag, inner) {
  return new Wrapper(doc.createElement(tag)).inner(inner)
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
  view.__bv(view, wrap)
  view.init()
  view.update()
  return view
}

/**
 * An object which caches and returns views of a same type.
 *
@cls -- any valid subclass of View
@cacheBy -- either:
    <undefined> in which case the sequence is used as key*
    A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
    A function called with (props, seq) which must return a key
*/

export class ViewCache {
  /**
   * @param {class} cls The class of View to create
   * @param {function} keyFn A function which obtains the key to cache by
   */
  constructor(cls, keyFn) {
    const defaultKeyFn = (props, seq) => seq
    this.cls = cls
    this.cache = {}
    this.keyFn = keyFn || defaultKeyFn
    this._seq = 0
  }
  getMany(items, parentView, reset) {
    if (reset) {
      this.reset()
    }
    return items.map(props => this.getOne(props, parentView))
  }
  getOne(props, parentView) {
    /*
    Gets a view, potentially from cache
    */
    let view, key = this.keyFn(props, this._seq)
    // TODO: can I detect whether we use seq?
    if (this.cache.hasOwnProperty(key)) {
      view = this.cache[key]
      if (parentView !== view.parent) {
        view.move(parentView)
      }
      view.update(props)
    } else {
      // Don't use nest
      view = createView(this.cls, props, parentView, this._seq)
      this.cache[key] = view
    }
    this._seq += 1
    return view
  }
  reset() {
    this._seq = 0
  }
}

/**
 * A wrapper around a DOM element.
 * All methods (some exceptions) return this, meaning they can be chained.
 */
export class Wrapper {
  constructor(element) {
    this.e = element
    this._items = [] // For advanced manipulation.
  }
  /**
   * Converts unknown item into an Element.
   */
  __cu(item) {
    let ct = item.constructor.name
    if (ct == 'Wrapper') {
      return item.e
    } else if (ct == 'View') {
      return item.root.e
    }
    return doc.createTextNode(item)
  }

  /**
   * Gets the element's value. Cannot be chained.
   */
  getValue() {
    /* Returns the value of the element */
    return this.e.value
  }
  transition(fn) {
    return new Promise(resolve => {
      fn()
      let transitionEnded = e => {
        this.e.removeEventListener('transitionend', transitionEnded)
        resolve()
      }
    this.e.addEventListener('transitionend', transitionEnded)
    })
  }

  /* Every method below must return 'this' so it can be chained */

  append(item) {
    this.e.appendChild(this.__cu(item))
    this._items.push(item)
    return this
  }
  att(name, value) {
    this.e.setAttribute(name, value)
    return this
  }
  atts(atts) {
    for (let name in atts) {
      this.att(name, atts[name])
    }
    return this
  }
  clear() {
    this.e.innerHTML = ''
    this.e.textContent = ''
    this.e.value = ''
    return this
  }
  checked(value) {
    this.e.checked = value
    return this
  }
  css(style) {
    this.e.className = style
    return this
  }
  cssAdd(style) {
    this.e.classList.add(style)
    return this
  }
  cssAddTrans(style) {
    return this.transition(_ => this.e.classList.add(style))
  }
  cssRemove(style) {
    this.e.classList.remove(style)
    return this
  }
  cssRemoveTrans(style) {
    return this.transition(_ => this.e.classList.remove(style))
  }
  cssToggle(style) {
    this.e.classList.toggle(style)
    return this
  }
  href(value) {
    return this.att('href', value)
  }
  html(html) {
    this.e.innerHTML = html
    return this
  }
  id(value) {
    return this.att('id', value)
  }
  /*
   * Add anything, including individual things.
   */
  inner(items) {
    if (!Array.isArray(items)) {
      items = [items]
    }
    return this.items(items, item => this.__cu(item))
  }
  /**
   * Set element's items.
   *
   * @param {array} items An array of items
   * @param {getEl} items A function which extracts the element from the item
   */
  items(items, getEl) {
    this.clear()
    for (var i=0, il=items.length; i<il; i++) {
      this.e.appendChild(getEl(items[i]))
    }
    this._items = items
    return this
  }
  on(event, callback) {
    this.e.addEventListener(event, e => callback(e, this))
    return this
  }
  replace(el) {
    this.e.parentNode.replaceChild(el, this.e)
    return this
  }
  src(value) {
    return this.att('src', value)
  }
  style(name, value) {
    this.e.style[name] = value
    return this
  }
  text(value) {
    this.e.textContent = value
    return this
  }
  visible(visible) {
    return this.style('visibility', visible? 'visible' : 'hidden')
  }
  value(value) {
    return this.att('value', value)
  }
  /*
   * Set nested items as views
   */
  views(views) {
    return this.items(views, view => view.root.e)
  }
  /*
   * Set nested items as wrappers
   */
  wrappers(wrappers) {
    return this.items(wrappers, wrapper => wrapper.e)
  }
}
