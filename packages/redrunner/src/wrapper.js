import {c, doc} from './helpers'


/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */
export function Wrapper(element) {
  this.e = element
  this._keys = undefined
  this._cache = undefined
}

const proto = Wrapper.prototype

/**
 * Get element as 'e' from item, else return text node.
 */
proto.__ge = function(item) {
  return item.e || doc.createTextNode(item)
}
/**
 * Gets the element's value. Cannot be chained.
 */
proto.getValue = function() {
  /* Returns the value of the element */
  return this.e.value
}
/**
 * Returns a promise which resolves after a transition.
 * Saves having to know times of transitions.
 */
proto.transition = function(fn) {
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

proto.append = function(item) {
  this.e.appendChild(this.__ge(item))
  return this
}
proto.att = function(name, value) {
  this.e.setAttribute(name, value)
  return this
}
proto.atts = function(atts) {
  for (let name in atts) {
    this.att(name, atts[name])
  }
  return this
}
proto.cache = function(cache) {
  this._cache = cache
  this._keys = []
  return this
}
proto.clear = function() {
  this.e.innerHTML = ''
  this.e.textContent = ''
  this.e.value = ''
  return this
}
proto.checked = function(value) {
  this.e.checked = value
  return this
}
proto.child = function(wrapper) {
  this.e.innerHTML = ''
  this.e.appendChild(wrapper.e)
  return this
}
proto.css = function(style) {
  this.e.className = style
  return this
}
proto.cssAdd = function(style) {
  this.e.classList.add(style)
  return this
}
proto.cssAddTrans = function(style) {
  return this.transition(_ => this.e.classList.add(style))
}
proto.cssRemove = function(style) {
  this.e.classList.remove(style)
  return this
}
proto.cssRemoveTrans = function(style) {
  return this.transition(_ => this.e.classList.remove(style))
}
proto.cssToggle = function(style) {
  this.e.classList.toggle(style)
  return this
}
proto.href = function(value) {
  return this.att('href', value)
}
proto.html = function(html) {
  this.e.innerHTML = html
  return this
}
proto.id = function(value) {
  return this.att('id', value)
}
/*
 * Set inner as individual item or array. Not optimised.
 */
proto.inner = function(items) {
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
proto.items = function(items) {
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
proto.on = function(event, callback) {
  this.e.addEventListener(event, e => callback(e, this))
  return this
}
proto.replace = function(el) {
  this.e.parentNode.replaceChild(el, this.e)
  return this
}
proto.src = function(value) {
  return this.att('src', value)
}
proto.style = function(name, value) {
  this.e.style[name] = value
  return this
}
proto.text = function(value) {
  this.e.textContent = value
  return this
}
proto.visible = function(visible) {
  return this.style('visibility', visible? 'visible' : 'hidden')
}
proto.value = function(value) {
  return this.att('value', value)
}
