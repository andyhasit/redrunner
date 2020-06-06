const {c, EOL} = require('../utils/constants')
const {isFunc, isUnd, splitTrim} = require('../utils/javascript')
const {expandShorthand, expandProperty, getLookupArgs} = require('./syntax')


class NodeData {
  constructor(node) {
    this.node = node
    this.saveAs = undefined
    this.wrapperClass = undefined
    this.shieldQuery = undefined
    this.props = undefined
    this.chainedCalls = []
    this.watches = []
    this.beforeSave = []
    this.afterSave = []
  }
  addWatch(property, converter, target) {
    this.watches.push({property, converter, target})
  }
  /**
   * Returns the call for creating a new wrapper based on nodePath.
   *
   * If wrapperClass is provided, it is initiated with new, and the class better
   * be in scope. That is why we do it with new here rather than passing the class
   * to __gw or so.
   * Similarly, that is why we use __gw, because we know "Wrapper" will be in scope
   * there, but it isn't guaranteed to be where the view is defined.
   *
   * I'm a bit uneasy having 'view' - should probably be a constant.
   */
  wrapperInit(nodePath) {
    const path = this.getLookupArgs(nodePath)
    return this.wrapperClass ? `new ${this.wrapperClass}(view.__lu(${path}))` : `view.__gw(${path})`
  }
  addEventListener(event, callbackStr) {
  const callbackCode = this.buildEventCallbackCode(callbackStr)
    this.chainedCalls.push(`on('${event}', ${callbackCode})`)
  }
  buildEventCallbackCode(statement) {
    let text = this.expandShorthand(statement.trim())
    const extra = text.endsWith(')') ? '' : '(e, w)'
    // Cater for '?' ending
    text = text.endsWith('?') ? text.slice(0, -1) : text
    // Convert 'this' to 'view' because of binding
    text = text.startsWith('this.') ? 'view' + text.substr(4) : text
    const body = `${text}${extra}`
    // TODO: do we need the intermediate function? Can't we just bind?
    return ['function(e, w) {', body, '}'].join(EOL)
  }
  processDirective(directiveName, directive, attVal) {
    if (!isFunc(directive.handle)) {
      throw new Error('handle must be a function')
    }
    let args = attVal
    if (directive.hasOwnProperty('params')) {
      let params = splitTrim(directive.params, ',')
      args = this.parseArgs(params, attVal)
      directive.handle.apply(this, args)
    } else {
      directive.handle.apply(this, [args])
    }
  }
  /**
   * Return array of args based on definitions
   *
   * @param {Array} params The parameters as strings
   * @param {String} attVal The raw attribute value.
   */
  parseArgs(params, attVal) {
    const args = []
    const chunks = splitTrim(attVal, '|')
    for (let i=0, il=params.length; i<il; i++) {
      let param = params[i]
      let raw = chunks[i]
      let value = this.parseArgValue(param, raw, i)
      args.push(value)
    }
    return args
  }
  parseArgValue(param, raw, i) {
    if ((!param.endsWith('?')) && (isUnd(raw))) {
      throw new Error(`Argument ${param} is required`)
    }
    return raw
  }
}


// Util methods:

NodeData.prototype.expandProperty = expandProperty
NodeData.prototype.expandShorthand = expandShorthand
NodeData.prototype.getLookupArgs = getLookupArgs

module.exports = {NodeData}