import {createView} from './utils'

/**
 * Caches same type views, retrieving by sequence.
 * Must not be shared.
 * 
 * @param {class} viewClass - The class of View to create.
 * @param {function} keyFn - A function which obtains the key to cache by
 */
export function KeyedCache(viewClass, keyFn) {
  this._v = viewClass
  this._f = keyFn
  this._k = []  // keys
  this._p = {}  // pool of view instances
}
const proto = KeyedCache.prototype

/**
 * Retrieves a single view. Though not used in RedRunner itself, it may
 * be used elsewhere, such as in the router.
 * 
 * @param {Object} item - The item which will be passed as props.
 * @param {View} parent - The parent view.
 */
proto.getOne = function(item, parent) {
  return this._get(this._p, this._v, this._f(item), item, parent)
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 * 
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {View} parent - The parent view.
 */
proto.patch = function(e, items, parent) {
  const pool = this._p
  const viewClass = this._v
  const keyFn = this._f
  const childNodes = e.childNodes
  const itemsLength = items.length
  const oldKeySequence = this._k
  const newKeys = []
  let item, key, view, childElementCount = oldKeySequence.length + 1
  for (let i=0; i<itemsLength; i++) {
    item = items[i]
    key = keyFn(item)
    view = this._get(pool, viewClass, key, item, parent)
    newKeys.push(key)
    if (i > childElementCount) {
      e.appendChild(view.e)
    } else if (key !== oldKeySequence[i]) {
      e.insertBefore(view.e, childNodes[i])
      pull(oldKeySequence, key, i)
    }
  }
  this._k = newKeys
  trimChildren(e, childNodes, itemsLength)
}

// Internal
proto._get = function(pool, viewClass, key, item, parent) {
  let view
  if (pool.hasOwnProperty(key)) {
    view = pool[key]
    view.setProps(item)
  } else {
    view = createView(viewClass, parent, item)
    pool[key] = view;
  }
  return view
}

/**
 * Caches same type views, retrieving by sequence.
 * Must not be shared.
 * 
 * @param {class} viewClass - The class of View to create.
 */
export function SequentialCache(viewClass) {
  this._v = viewClass
  this._p = []  // pool of view instances
  this._c = 0   // Child element count
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 * 
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {View} parent - The parent view.
 */
SequentialCache.prototype.patch = function(e, items, parent) {
  const pool = this._p
  const viewClass = this._v
  const childNodes = e.childNodes
  const itemsLength = items.length
  let item, view, poolCount = pool.length, childElementCount = this._c

  for (let i=0; i<itemsLength; i++) {
    item = items[i]
    if (i < poolCount) {
      view = pool[i]
      view.setProps(item)
    } else {
      view = createView(viewClass, parent, item)
      pool.push(view)
      poolCount ++
    }
    if (i >= childElementCount) {
      e.appendChild(view.e)
    }
  }
  this._c = itemsLength
  trimChildren(e, childNodes, itemsLength)
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

/**
 * Trims the unwanted child elements from the end.
 * 
 * @param {Node} e 
 * @param {Array} childNodes 
 * @param {Int} itemsLength 
 */
function trimChildren(e, childNodes, itemsLength) {
  let lastIndex = childNodes.length - 1
  let keepIndex = itemsLength - 1
  for (let i=lastIndex; i>keepIndex; i--) {
    e.removeChild(childNodes[i])
  }
}

/**
 * Pulls an item forward in an array, to replicate insertBefore.
 * @param {Array} arr 
 * @param {any} item 
 * @param {Int} to 
 */
function pull(arr, item, to) {
  const position = arr.indexOf(item)
  if (position != to) {
    arr.splice(to, 0, arr.splice(position, 1)[0])
  }
}
