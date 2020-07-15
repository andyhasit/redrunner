/**
 * Used internally.
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
export function QueryCollection(queryCallbacks) {
  this.qc = queryCallbacks
  this.run = {}
}
const proto = QueryCollection.prototype


proto.reset = function() {
  this.run = {}
}


proto.get = function(view, key) {
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
  }
  return run[key]
}
