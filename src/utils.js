const doc = document;

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
  let target = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)) : elementOrId
  target.parentNode.replaceChild(view.root.e, target)
  console.log(view.root.e.outerHTML)
  console.log(target.outerHTML)
  return view
}

/**
 * Creates a wrapper from an HTML string.
 */
export function wrap(html) {
  let throwAway = document.createElement('template')
  throwAway.innerHTML = html
  return new Wrapper(throwAway.content.firstChild)
}

/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */
export function h(tag, inner) {
  return new Wrapper(document.createElement(tag)).inner(inner)
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
   * @param {object} parent The parent view (optional)
   */
  constructor(cls, view, keyFn) {
    let defaultKeyFn = (props, seq) => seq
    this.view = view
    this.cls = cls
    this.cache = {}
    this.keyFn = keyFn || defaultKeyFn
    this._seq = 0
  }
  reset() {
    this._seq = 0
  }
  get(props) {
    /*
    Gets a view, potentially from cache
    */
    let view, key = this.keyFn(props, this._seq)
    if (this.cache.hasOwnProperty(key)) {
      view = this.cache[key]
    } else {
      view = createView(this.cls, props, this.view, this._seq)
      this.cache[key] = view
    }
    view.update(props)
    this._seq += 1
    return view
  }
}

export class Wrapper {
  constructor(element, view) {
    this.e = element
    this._c = undefined // The viewCache, if any
    this._n = undefined //  
    this.view = view
  }
  
  // Methods which potentially change the containing view's nested views 
  append(item) {
    return this._append(item)
  }
  _append(item) {
    return this.e.appendChild(item.e)
  }
  child(item) {
    this.clear()
    return this._append(item)
  }
  replace(el) {
    this.e.parentNode.replaceChild(el, this.e)
  }
  clear() {
    if (this._n) {
      this._n.length = 0
    }
    this.e.innerHTML = ''
    this.e.textContent = ''
    this.e.value = ''
    return this
  }
  html(html) {
    this.e.innerHTML = html
    return this
  }
  inner(items) {
    /*
     * Use this for adding standard lists of items. Use items() is you used use()
     */
    if (!Array.isArray(items)) {
      return this.child(items)
    }
    this._prepRepeat()
    for (var i=0, il=items.length; i<il; i++) {
      this._append(items[i])
    }
    return this._done()
  }
  items(items) {
    this._prepRepeat()
    let view
    for (var i=0, il=items.length; i<il; i++) {
      view = this._c.get(items[i])
      this._nest(view)
      this.e.appendChild(view.root.e)
    }
    return this._done()
  }
  _nest(view) {
    //TODO: the idea of this it to keep track of nested views. Check it works...
    if (!this._n) {
      this._n = this.view.__nv
    }
    this._n.push(view)
  }
  _prepRepeat() {
    this.visible(false)
    this.clear()
  }
  _done() {
    this.visible(true)
    return this
  }
  use(cls) {
    this._c = new ViewCache(cls, this)
    return this
  }
  watch(desc, callback) {
    /*
     *   Watch a value and do something if it has changed.
     * 
     *   This method has two forms.
     * 
     *   If desc does not contain ":" then the callback is simply called if the value 
     *   changes (during the view's update() call)
     *
     *   The callback parameters are (newVal, oldVal, wrapper) 
     *   E.g.
     *
     *      h('div').watch('clickCount', (n,o,w) => w.text(n))
     *
     *   If the desc contains ":" (e.g. "text:clickCount") then we assume what is to 
     *   the left of : to be a method of the wrapper to call if the value has changed.
     *   E.g.
     *
     *       h('div').watch('text:clickCount')  // equates to wrapper.text(newValue)
     *   
     *   In this form, a callback may be provided to transform the value before it is
     *   used. Its parameters are (newVal, oldVal) 
     *   
     *    E.g.
     *
     *       h('div').watch('text:clickCount', (n,o) => `Click count is ${n}`)
     *   
     */
    let path, func, chunks = desc.split(':')
    if (chunks.length === 1) {
      path = chunks[0]
      func = (n,o) => callback(n,o,this)
    } else {
      let method = chunks[0]
      path = chunks[1]
      func = und(callback) ? n => this[method](n) : (n,o) => this[method](callback(n,o,this)) 
    }
    this.view.watch(path, func)
    return this
  }

  // These methods are mostly simple DOM wrappers

  get Value() {
    /* Returns the value of the element */
    return this.e.value
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
  checked(value) {
    this.e.checked = value
    return this
  }
  href(value) {
    return this.att('href', value)
  }
  id(value) {
    return this.att('id', value)
  }
  src(value) {
    return this.att('src', value)
  }
  value(value) {
    return this.att('value', value)
  }
  text(value) {
    this.e.textContent = value
    return this
  }
  on(event, callback) {
    this.e.addEventListener(event, e => callback(e, this))
    return this
  }
  style(name, value) {
    this.e.style[name] = value
    return this
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
  visible(visible) {
    return this.style('visibility', visible? 'visible' : 'hidden')
  }
}
