import {createView} from './utils'

const defaultKeyFn = (props, seq) => seq

/**
 * An object which caches and returns views of a same type, using a key Function
 * to retrieve views.
 * @param {class} cls The class of View to create
 * @param {function} keyFn A function which obtains the key to cache by
 */
export function KeyedCache(cls, keyFn) {
  this.cls = cls
  this.cache = {}
  this.keyFn = keyFn
  this._seq = 0
}

KeyedCache.prototype = {
  /**
   * Gets a view, potentially from cache.
   */
  getOne: function(props, parentView) {
    let view, key = this.keyFn(props)
    if (this.cache.hasOwnProperty(key)) {
      view = this.cache[key]
      if (parentView !== view.parent) {
        view.move(parentView)
      }
      view.setProps(props)
    } else {
      view = createView(this.cls, parentView, props)
      this.cache[key] = view
    }
    this._seq += 1
    return {view, key}
  },
  reset: function() {
    this._seq = 0
  }
}

/**
 * An object which caches and returns views of a same type, caching by sequence.
 * @param {class} cls The class of View to create.
 */
export function SequentialCache(cls) {
  this.cls = cls
  this.cache = []
  this._seq = 0
}

SequentialCache.prototype = {
  getOne: function(props, parentView) {
    let view
    if (this._seq < this.cache.length) {
      view = this.cache[this._seq]
      if (parentView !== view.parent) {
        view.move(parentView)
      }
      view.setProps(props)
    } else {
      view = createView(this.cls, parentView, props)
      this.cache.push(view)
    }
    this._seq += 1
    return {view: view, key: this._seq}
  },
  reset: function() {
    this._seq = 0
  }
}