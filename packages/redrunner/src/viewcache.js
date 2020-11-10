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


/**
 * An object which creates and caches views according to the mappings provided.
 * If there is no match in the mappings, the fallback function is called.
 * 
 * Note that the fallback must return an instance (of View or Wrapper) whereas
 * mappings must specify view classes. 
 * 
 * You can rely solely on the fallback if you like.
 * 
 * @param {Object} mappings - a mapping of format key->viewClass
 * @param {function} fallback - a function to call when no key is provided.
 * 
 */
export function InstanceCache(mappings, fallback) {
  this._m = mappings
  this._f = fallback
  this._i = {} // Instances
}

InstanceCache.prototype.getOne = function(key, parentView) {
  if (!this._i.hasOwnProperty(key)) {
    this._i[key] = this._m.hasOwnProperty(key) ?
      parentView.nest(this._m[key]) : this._f(key, parentView)
  }
  return this._i[key]
}