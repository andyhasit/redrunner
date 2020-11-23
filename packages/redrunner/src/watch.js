/**
 * Used internally. Represents a watch on an element.
 */
export function Watch (wrapperKey, shieldQuery, reverseShield, shieldCount, callbacks) {
  this.wk = wrapperKey       // The key of the corresponding wrapper.
  this.sq = shieldQuery      // The shield query key
  this.rv = reverseShield    // whether shieldQuery should be flipped
  this.sc = shieldCount      // The number of items to shield
  this.cb = callbacks        // Callbacks - object
}

/**
 * Applies the callbacks.
 */
Watch.prototype.go = function(view) {
  for (let key in this.cb) {
    let callback = this.cb[key]
    if (key === '*') {
      callback.apply(view)
    } else {
      // means: {new, old, changed}
      const {n, o, c} = view.lookup(key)
      if (c) {
        callback.apply(view, [n, o])
      }
    }
  }
}