const {c, EOL, htmlparse} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {RedRunnerSyntaxError, watchArgs} = require('./constants')
const {findRedRunnerAtts, removeRedRunnerCode} = require('./special-atts')
const {expandShorthand, lookupArgs, parseTarget} = require('./views')
const {extractInlineCallWatches} = require('./inline')

/**
 * A class for generating all the statements to be added to a RedRunner view.
 */
class ViewClassParser {
  constructor(viewData) {
    let {className, htmlString, path, node} = viewData
    this.cloneNode = viewData.cloneNode
    this.className = className
    this.node = node
    this.path = path
    this.strippedHtml = stripHtml(htmlString)
    this.buildMethodLines = []    // The method lines, as code
    this.domObjectLines = []      // The lines for this.dom = {}
    this.watchCallbackItems = {}  // Entries for the __wc object
    this.watchQueryItems = {}     // Entries for the __wq object
    this.randVarCount = 0
    this.dom = undefined
    this.currentNode = undefined
    this.cleanHTML = undefined
  }
  parse() {

    // Recursively processes each node in the DOM
    const processNode = (node, i) => {
      this.currentNode = node
      nodePath.push(i)
      const tagName = node.tagName
      if (tagName) {
        const isCapitalized = /[A-Z]/.test(tagName[0])
        const processFunction = isCapitalized ? this.processViewNode : this.processNormalNode
        processFunction.apply(this, [nodePath, node, tagName])
      }
      node.childNodes.forEach(processNode)
      nodePath.pop()
    }

    this.dom = htmlparse.parse(this.strippedHtml)
    const nodePath = []    // The path of current node recursion

    try {
      processNode(this.dom)
    } catch (err) {
      if (err instanceof RedRunnerSyntaxError) {
        throw this.path.hub.buildError(this.node, err.message, RedRunnerSyntaxError)
      } else {
        throw err; // unknown error, rethrow it (**)
      }
    }

    return {
      cleanHTML: removeRedRunnerCode(this.dom),
      buildMethodLines: this.buildMethodLines,
      domObjectLines: this.domObjectLines,
      watchCallbackItems: this.watchCallbackItems,
      watchQueryItems: this.watchQueryItems
    }
  }
  processViewNode(nodePath, node, tagName) {
    let {props, saveAs} = findRedRunnerAtts(node)
    const lines = this.buildMethodLines
    const constructorStr = props? `view.nest(${tagName}, ${props})` : `view.nest(${tagName})`;
    if (saveAs) {
      lines.push(`let ${saveAs} = ${constructorStr};`)
      lines.push(`view.__rn(${lookupArgs(nodePath)}, ${saveAs});`)
      this.domObjectLines.push(`${saveAs}: ${saveAs},`)
    } else {
      lines.push(`view.__rn(${lookupArgs(nodePath)}, ${constructorStr});`)
    }
  }
  processNormalNode(nodePath, node, tagName) {
    let {nest, on, saveAs, watch, wrapperClass} = findRedRunnerAtts(node)
    let wrapperCall, chainedCalls = ''

    /* Generates a unique variable name if saveAs has not been defined */
    const implicitSave = _ => saveAs = saveAs ?  saveAs : this.getUniqueVarName()

    const inlineCallsWatches = extractInlineCallWatches(node)

    if (inlineCallsWatches.length > 0) {
      implicitSave()
      inlineCallsWatches.forEach(w => this.addNodeWatch(w, saveAs))
    }
    if (watch) {
      implicitSave()
      this.addNodeWatch(watch, saveAs)
    }
    if (nest) {
      implicitSave()
      this.addNestWatch(nest, saveAs)
      wrapperCall = this.getCachedWrapperCall(nest, nodePath, wrapperClass)
    }
    if (on) {
      implicitSave()
      // We can use a chained call on the wrapper because it returns "this"
      chainedCalls = `.on('${on.event}', ${on.callback})`
    }
    if (saveAs) {
      wrapperCall = wrapperCall || this.getRegularWrapperCall(nodePath, wrapperClass)
      this.domObjectLines.push(`${saveAs}: ${wrapperCall}${chainedCalls},`)
    }
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
  getRegularWrapperCall(nodePath, wrapperClass) {
    const path = lookupArgs(nodePath)
    return wrapperClass ? `new ${wrapperClass}(view.__lu(${path}))` : `view.__gw(${path})`
  }
  getCachedWrapperCall(nest, nodePath, wrapperClass) {
    const path = lookupArgs(nodePath)
    const config = nest.config? expandShorthand(nest.config) : '{}'
    let cache

    const getCacheKeyFunction = key => {
      if (key.endsWith('?')) {
        return expandShorthand(key.slice(0, -1))
      }
      return `function(props) {return props.${key}}`
    }
    // Build cache call
    if (nest.cache.startsWith('@')) {
      cache = expandShorthand(nest.cache.substr(1))
    } else {
      const [viewCacheClass, viewCacheKey] = nest.cache.split(':')
      if (viewCacheKey) {
        const keyFn = getCacheKeyFunction(viewCacheKey)
        cache = `view.__kc(${viewCacheClass}, ${keyFn})`
      } else {
        cache = `view.__sc(${viewCacheClass})`
      }
    }

    if (wrapperClass) {
      return `new ${wrapperClass}(view.__lu(${path}), ${cache}, ${config})`
    }
    return `view.__cw(${path}, ${cache}, ${config})`
  }
  /**
   * Adds a watch for the nest attribute.
   */
  addNestWatch(nest, saveAs) {
    const wrapper = `this.dom.${saveAs}`
    const callbackBody = `${wrapper}.items(${nest.convert})`
    this.saveWatch(nest.name, nest.property, callbackBody)
  }
  /**
   * Adds a watch, creating both the callback and the query functions.
   *
   * @param {object} watch An object of shape {name, convert, target}
   * @param {string} saveAs The name to which the wrapper is to be saved.
   *
   */
  addNodeWatch(watch, saveAs) {
    let callbackBody, wrapper = `this.dom.${saveAs}`
    if (watch.target) {
      const targetString = parseTarget(watch.target)
      if (watch.raw) {
        callbackBody = `${wrapper}.${targetString}${watch.raw})`
      } else if (watch.convert) {
        callbackBody = `${wrapper}.${targetString}${watch.convert})`
      } else {
        callbackBody = `${wrapper}.${targetString}n)`
      }
    } else {
      // No watch target. Assume convert is provided.
      // But it needs messy adjusting...
      if (watch.convert.endsWith(watchArgs)) {
        callbackBody = `${watch.convert.slice(0, -1)}, ${wrapper})`
      } else if (watch.convert.endsWith(')')) {
        callbackBody = `${watch.convert}`
      } else {
        callbackBody = `${watch.convert}${watchArgs.slice(0, -1)}, ${wrapper})`
      }
    }
    this.saveWatch(watch.name, watch.property, callbackBody)
  }
  saveWatch(name, property, callbackBody) {
    const callbackStatement = ['function(n, o) {', callbackBody, '},'].join(EOL)
    this.getWatchCallbackItems(name).push(callbackStatement)
    this.watchQueryItems[name] = `function() {return ${property}}`
  }
  /**
   * Returns the Array of callback for a watch, creating is necessary.
   */
  getWatchCallbackItems(name) {
    if (!this.watchCallbackItems.hasOwnProperty(name)) {
      this.watchCallbackItems[name] = []
    }
    return this.watchCallbackItems[name]
  }
  /**
   * Returns a short variable name guaranteed to be unique within the view.
   */
  getUniqueVarName() {
    this.randVarCount ++
    return '__' + this.randVarCount
  }
  /**
   * Exit with an error.
   * TODO: flesh this out to print more useful info.
   */
  error(message) {
    throw this.path.hub.buildError(this.node, '\nfaaaaaaaaaaail', SyntaxError)
  }
}

module.exports = {ViewClassParser}