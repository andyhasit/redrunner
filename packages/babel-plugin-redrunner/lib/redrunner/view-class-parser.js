const {c, EOL, htmlparse} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {watchArgs} = require('./constants')
const {addPrototypeField, addPrototypeFunction, addPrototypeObject} = require('../utils/javascript')
const {findRedRunnerAtts, removeRedRunnerCode} = require('./special-atts')
const {expandShorthand, lookupArgs, getWrapperCall, parseTarget} = require('./views')
const {extractInlineCallWatches} = require('./inline')

/**
 * A class for generating all the statements to be added to a RedRunner view.
 */
class ViewClassParser {
  constructor(viewData) {
    let {className, htmlString} = viewData
    this.cloneNode = viewData.cloneNode
    this.className = className
    this.strippedHtml = stripHtml(htmlString)
    this.buildMethodLines = []    // The method lines, as code
    this.domObjectLines = []      // The lines for this.dom = {}
    this.watchCallbackItems = {}  // Entries for the __wc object
    this.watchQueryItems = {}     // Entries for the __wq object
    this.randVarCount = 0
    this.dom = undefined
    this.currentNode = undefined

    // The final statements, as strings:
    this.statementFor__bv = undefined  // The build view method 
    this.statementFor__cn = undefined  // The clonable node
    this.statementFor__ht = undefined  // The HTML string
    this.statementFor__wc = undefined  // The watcher callbacks
    this.statementFor__wq = undefined  // The watcher queries
  }
  generateStatements() {
    this.dom = htmlparse.parse(this.strippedHtml)
    this.parseHtmlProperty()
    //this.parseWatchProperty() ...?

    // Assemble the statements
    this.assembleStatementFor__bv()
    this.assembleStatementFor__cn()
    this.assembleStatementFor__ht()
    this.assembleStatementFor__wc()
    this.assembleStatementFor__wq()

    // Return only statements which contain something...
    return [
      this.statementFor__bv,
      this.statementFor__cn,
      this.statementFor__ht,
      this.statementFor__wc, 
      this.statementFor__wq,
    ].filter(s => s)
  }
  parseHtmlProperty() {
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
    
    const nodePath = []    // The path of current node recursion
    processNode(this.dom)
  }
  assembleStatementFor__bv() {
    const lines = []
    lines.push(`view.__bd(prototype, ${this.cloneNode});`)
    
    // Add remaining lines (must come before dom!)
    this.buildMethodLines.forEach(n => lines.push(n))

    // Add this.dom definition
    if (this.domObjectLines.length > 0) {
      lines.push('view.dom = {')
      this.domObjectLines.forEach(n => lines.push(n))
      lines.push('};')
    } else {
      lines.push('view.dom = {};')
    }
    const body = lines.join(EOL)
    this.statementFor__bv = addPrototypeFunction(this.className, '__bv', 'view, prototype', body)
  }
  assembleStatementFor__cn() {
    if (this.cloneNode) {
      this.statementFor__cn = addPrototypeField(this.className, '__cn', 'undefined')
    }
  }
  assembleStatementFor__ht() {
    // This only removes redrunner atts, the inlines we removed in place.
    // Perhaps change this to make behaviour consistent.
    const htmlString = removeRedRunnerCode(this.dom)
    this.statementFor__ht = addPrototypeField(this.className, '__ht', `'${htmlString}'`)  
  }
  assembleStatementFor__wc() {
    const lines = []
    for (let [key, value] of Object.entries(this.watchCallbackItems)) {
      lines.push(`'${key}': [`)
      value.forEach(e => lines.push(e))
      lines.push(`],`)
    }
    if (lines.length) {
      const body = lines.join(EOL)
      this.statementFor__wc = addPrototypeObject(this.className, '__wc', body)
    }
  }
  assembleStatementFor__wq() {
    const lines = []
    for (let [key, value] of Object.entries(this.watchQueryItems)) {
      lines.push(`'${key}': ${value},`)
    }
    if (lines.length) {
      const body = lines.join(EOL)
      this.statementFor__wq = addPrototypeObject(this.className, '__wq', body)
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
    let chainedCalls = ''

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
    }
    if (on) {
      implicitSave()
      // We can use a chained call on the wrapper because it returns "this"
      chainedCalls = `.on('${on.event}', ${on.callback})`
    }
    if (saveAs) {
      const wrapperCall = getWrapperCall(nodePath, wrapperClass)
      this.domObjectLines.push(`${saveAs}: ${wrapperCall}${chainedCalls},`)
    }
  }
  /**
   * Adds a watch for the nest attribute.
   */
  addNestWatch(nest, saveAs) {
    let viewCacheGetViewsCall, callbackBody, wrapper = `this.dom.${saveAs}`

    const buildCachedCall = (cacheName, reset) => {
      const cacheCall = `${cacheName}.getMany(${nest.convert}, this, ${reset})`
      return `${wrapper}.views(${cacheCall})`
    }

    const namedViewCacheCall = _ => {
      const cacheName = expandShorthand(nest.cache.substr(1))
      return buildCachedCall(cacheName, false)
    }

    const ownViewCacheCall = _ => {
      const [viewCacheClass, viewCacheKey] = nest.cache.split(':')
      const generatedCacheName = this.getUniqueVarName()
      const cacheName = `this.dom.${generatedCacheName}`
      let viewCacheParam = ''
      if (nest.keyFn && viewCacheKey) {
        this.error('You cannot provide both a keyFn and a key.', 'att:nest')
      } else if (nest.keyFn) {
        viewCacheParam = `, ${expandShorthand(nest.keyFn)}`
      } else if (viewCacheKey) {
        viewCacheParam = `, '${viewCacheKey}'`
      }
      const createViewCacheStatement = `view.__nc(${viewCacheClass}${viewCacheParam})`
      this.domObjectLines.push(`${generatedCacheName}: ${createViewCacheStatement},`)
      return buildCachedCall(cacheName, true)
    }

    if (nest.cache === undefined) {
      callbackBody = `${wrapper}.inner(${nest.convert})`
    } else if (nest.cache === '') {
      callbackBody = `${wrapper}.wrappers(${nest.convert})`
    } else if (nest.cache.startsWith('@')) {
      callbackBody = namedViewCacheCall()
    } else {
      callbackBody = ownViewCacheCall()
    }

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
    c.log(this.currentNode)
    new Error(message)
  }
}


module.exports = {ViewClassParser}