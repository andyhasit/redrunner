/**
 * Used internally.
 * An object which caches the results of lookup queries so we don't have to
 * repeat them in the same view.
 * The Lookup instance will be shared between instances of a view.
 * Must call reset() on every update.
 */
export function Lookup(callbacks) {
  this.callbacks = callbacks
  this.run = {}
}

Lookup.prototype = {
  get: function(view, key) {
    const run = this.run
    if (run[key] === undefined) {
      // Verbose but efficient way as it avoids lookups?
      // Or is this harmful to performance because we're just reading values more than calling functions?
      const o = view.__ov[key]
      const n = this.callbacks[key](view, view.props)
      const c = n !== o
      view.__ov[key] = n
      const rtn = {n, o, c}
      run[key] = rtn
      return rtn
    }
    return run[key]
  },
  reset: function() {
    this.run = {}
  }
}

