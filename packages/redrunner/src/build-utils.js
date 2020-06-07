

/**
 * Used internally.
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
class QueryCache {
  constructor(queryCallbacks) {
    this.qc = queryCallbacks
    this.run = {}
    for (let key in queryCallbacks) {
      this.run[key] = undefined
    }
  }
  reset() {
    const run = this.run
    for (let key in run) {
      run[key] = undefined
    }
  }
  get(view, key) {
    const run = this.run
    if (run[key] === undefined) {
      // Verbose but efficient way as it avoids lookups?
      const o = view.__ov[key]
      const n = this.qc[key].apply(view)
      const c = n !== o
      view.__ov[key] = n
      const rtn = {n, o, c}
      run[key] = rtn
      return rtn
    } else {
      return run[key]
    }
  }
}

/**
 * Used internally.
 * Represents a watch on an element.
 */
class Watch {
  constructor(el, shieldQuery, callbacks) {
    this.el = el                     // The name of the saved element.
    this.shieldQuery = shieldQuery   // The shield query key -
    this.callbacks = callbacks       // Callbacks - object
    this.blockCount = 1
    this.reverse = false             // whether shieldQuery should be flipped
  }
  shieldFor(view, watch, queryCache) {
    if (this.shieldQuery) {
      const {n} = queryCache.get(view, this.shieldQuery)
      const hide = this.reverse? ! n : n
      view.dom[watch.el].visible(!hide)
      return hide ? this.blockCount : 0
    }
    return 0
  }
  appyCallbacks(view, queryCache) {
    for (let [key, callback] of Object.entries(this.callbacks)) {
      if (key === '*') {
        callback.apply(view)
      } else {
        // means: {new, old, changed}
        const {n, o, c} = queryCache.get(view, key)
        if (c) {
          callback.apply(view, [n, o])
        }
      }
    }
  }
}


export const buildUtils = {
  getWatch: function(el, shieldQuery, callbacks) {
    return new Watch(el, shieldQuery, callbacks)
  },
  getQueryCache: function(callbacks) {
    return new QueryCache(callbacks)
  }
}