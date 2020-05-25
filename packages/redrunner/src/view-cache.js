import {createView, isStr, Wrapper} from './utils'

/**
 * An object which caches and returns views of a same type.
 *
@cls -- any valid subclass of View
@cacheBy -- either:
    <undefined> in which case the sequence is used as key*
    A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
    A function called with (props, seq) which must return a key
*/


const defaultKeyFn = (props, seq) => seq

export class ViewCache {
  /**
   * @param {class} cls The class of View to create
   * @param {function} keyFn A function which obtains the key to cache by
   */
  constructor(cls, keyFn) {
    this.cls = cls
    this.cache = {}
    this.keyFn = isStr(keyFn) ? props => props[keyFn] : (keyFn || defaultKeyFn)
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
