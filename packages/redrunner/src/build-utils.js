

/**
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
class QueryCache {
  constructor(queryCallbacks) {
    this.qc = queryCallbacks
    // Values for current run of update
    this.run = {}
  }
  reset() {
    const run = this.run
    for (let key in run) {
      run[key] = undefined
    }
  }
  get(view, key) {
    const run = this.run
    if (key in run) { // change to (run[key] === undefined) later
      return run[key]
    } else {
      // Verbose but efficient way as it avoids lookups?
      console.log(key)
      const o = view.__ov[key]
      const n = this.qc[key].apply(view)
      const c = n !== o
      view.__ov[key] = n
      const rtn = {n, o, c}
      run[key] = rtn
      return rtn
    }
  }
}


class Watch {
  constructor(el, shieldQuery, callbacks) {
    this.el = el
    this.shieldQuery = shieldQuery
    this.callbacks = callbacks
    this.blockCount = 0
  }
  shieldFor(view, queryCache) {
    if (this.shieldQuery && queryCache.get(view, this.shieldQuery)) {
      return this.blockCount
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