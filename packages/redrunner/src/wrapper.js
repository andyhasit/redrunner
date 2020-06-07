import {c, doc} from './helpers'


/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */
export class Wrapper {
  constructor(element) {
    this.e = element
    this._keys = undefined
    this._cache = undefined
  }
  /**
   * Get element as 'e' from item, else return text node.
   */
  __ge(item) {
    return item.e || doc.createTextNode(item)
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
    this.e.appendChild(this.__ge(item))
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
  cache(cache) {
    this._cache = cache
    this._keys = []
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
  child(wrapper) {
    this.e.innerHTML = ''
    this.e.appendChild(wrapper.e)
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
   * Set inner as individual item or array. Not optimised.
   */
  inner(items) {
    if (!Array.isArray(items)) {
      items = [items]
    }
    const e = this.e
    e.innerHTML = ''
    for (var i=0, il=items.length; i<il; i++) {
      e.appendChild(this.__ge(items[i]))
    }
    return this
  }
  /*
   * Set items from cache.
   */
  items(items) {
    const e = this.e
    const childNodes = e.childNodes
    const cache = this._cache
    const oldKeys = this._keys
    const newKeys = []
    const itemsLength = items.length
    let canAddNow = oldKeys.length - 1
    cache.reset()
    const start = performance.now()
    /*
     * We loop over the newKeys and pull Elements forward.
     * oldKeys will be edited in place to look like newKeys, but may have trailing
     * keys which represent the items to be removed.
     */
    for (let i=0; i<itemsLength; i++) {
      let item = items[i]
      let {view, key} = this._cache.getOne(item)
      newKeys.push(key)
      if (i > canAddNow) {
        e.appendChild(view.e, this)
      } else if (key !== oldKeys[i]) {
        /*
         * Note: insertBefore removes the element from the DOM if attached
         * elsewhere, which should either only be further down in the
         * childNodes, or in case of a shared cache, somewhere we don't
         * care about removing it from, so its OK.
         */
        e.insertBefore(view.e, childNodes[i])
      }
    }
    let lastIndex = childNodes.length - 1
    let keepIndex = itemsLength - 1
    for (let i=lastIndex; i>keepIndex; i--) {
      e.removeChild(childNodes[i])
    }
    this._keys = newKeys
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
}
