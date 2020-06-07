/**
 * Used internally.
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
export class QueryCollection {
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
