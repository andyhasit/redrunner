/**
 * Used internally.
 * Represents a watch on an element.
 */
export class Watch {
  constructor(el, shieldQuery, reverseShield, callbacks) {
    this.el = el                         // The name of the saved element.
    this.shieldQuery = shieldQuery       // The shield query key -
    this.reverseShield = reverseShield   // whether shieldQuery should be flipped
    this.callbacks = callbacks           // Callbacks - object
    this.blockCount = 1
  }
  shieldFor(view, watch, queryCache) {
    if (this.shieldQuery) {
      const {n} = queryCache.get(view, this.shieldQuery)
      const visible = this.reverseShield? n : !n
      view.dom[watch.el].visible(visible)
      return visible ? 0: this.blockCount
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