/**
 * Used internally. Represents a watch on an element.
 */
export function Watch (el, shieldQuery, reverseShield, shieldCount, callbacks) {
  this.el = el                         // The name of the saved element.
  this.shieldQuery = shieldQuery       // The shield query key -
  this.reverseShield = reverseShield   // whether shieldQuery should be flipped
  this.shieldCount = shieldCount       // The number of items to shield
  this.callbacks = callbacks           // Callbacks - object
}

Watch.prototype.appyCallbacks = function(view) {
  for (let [key, callback] of Object.entries(this.callbacks)) {
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