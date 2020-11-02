const {c, EOL} = require('../utils/constants')
const {isFunc, isUnd, splitTrim} = require('../utils/misc')
const {
  buildCacheInit,
  buildEventCallback,
  buildWatchCallbackLine,
  expandPrefix,
  expandConverter,
  getLookupArgs,
  getWatchQueryCallBack,
  parseWatchedValueSlot
} = require('./syntax')
const {buildInlineWatch, processInlineWatches} = require('./inline')

class NodeData {
  constructor(node, asStub) {
    this.node = node
    this.asStub = asStub // whether the whole html declaration is a stub
    this.stubName = undefined // Whether this node should be a stub
    this.saveAs = undefined
    this.customWrapperClass = undefined
    this.customWrapperArgs = undefined
    this.props = undefined
    this.shieldQuery = undefined
    this.reverseShield = 0
    this.replaceWith = undefined
    this.chainedCalls = []
    this.watches = []
    this.beforeSave = []
    this.afterSave = []
  }
  addWatch(property, converter, target, extraArgs) {
    this.watches.push({property, converter, target, extraArgs})
  }
  /**
   * Returns the call for creating a new wrapper based on nodePath.
   *
   * If customWrapperClass is provided, it is initiated with new, and the class better
   * be in scope. That is why we do it with new here rather than passing the class
   * to __gw or so.
   * Similarly, that is why we use __gw, because we know "Wrapper" will be in scope
   * there, but it isn't guaranteed to be where the view is defined.
   *
   */
  wrapperInit(nodePath) {
    const path = this.getLookupArgs(nodePath)
    if (this.wrapperOverride) {
      return this.wrapperOverride
    } else if (this.customWrapperClass) {
      const args = this.customWrapperArgs ? ',' + this.customWrapperArgs : ''
      return `new ${this.customWrapperClass}(view.__fe(${path})${args})`
    }
    return `view.__gw(${path})`
  }
  addEventListener(event, callbackStr) {
    const callback = this.buildEventCallback(callbackStr)
    this.chainedCalls.push(`on('${event}', ${callback})`)
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


// Util methods that we may want to use in config:

NodeData.prototype.buildCacheInit = buildCacheInit
NodeData.prototype.buildWatchCallbackLine = buildWatchCallbackLine
NodeData.prototype.buildEventCallback = buildEventCallback
NodeData.prototype.expandConverter = expandConverter
NodeData.prototype.expandPrefix = expandPrefix
NodeData.prototype.processInlineWatches = processInlineWatches
NodeData.prototype.buildInlineWatch = buildInlineWatch
NodeData.prototype.getLookupArgs = getLookupArgs
NodeData.prototype.getWatchQueryCallBack = getWatchQueryCallBack
NodeData.prototype.parseWatchedValueSlot = parseWatchedValueSlot

module.exports = {NodeData}