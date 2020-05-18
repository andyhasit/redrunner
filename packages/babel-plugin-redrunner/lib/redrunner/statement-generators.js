const {c, EOL, htmlparse} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {addPrototypeFunction, addPrototypeObject} = require('../utils/javascript')
const {findRedRunnerAtts, removeRedRunnerCode} = require('./special-atts')
const {lookupArgs, getWrapperCall, parseTarget} = require('./views')
const {extractInlineCallWatches} = require('./inline')

/**
 * A class for generating all the statements to be added to a RedRunner view.
 */
class ViewProcessor {
  constructor(viewData) {
    let {className, htmlString} = viewData
    this.className = className
    this.strippedHtml = stripHtml(htmlString)
    this.buildMethodLines = []    // The method lines, as code
    this.domObjectLines = []      // The lines for this.dom = {}
    this.watchCallbackItems = {}  // Entries for the __wc object
    this.watchQueryItems = {}     // Entries for the __wq object
    this.randVarCount = 0
    this.dom = undefined

    // The final statements, as strings:
    this.statementFor__bv = undefined
    this.statementFor__wc = undefined
    this.statementFor__wq = undefined
  }
  processView() {
    this.dom = htmlparse.parse(this.strippedHtml)
    this.parseHtmlProperty()
    //this.parseWatchProperty() ...?

    this.createStatementFor__bv() 
    this.createStatementFor__wc() 
    this.createStatementFor__wq() 
  }
  parseHtmlProperty() {
    const self = this
    // Recursively processes each node in the DOM
    function processNode(node, i) {
      nodePath.push(i)
      const tagName = node.tagName
      if (tagName) {
        const isCapitalized = /[A-Z]/.test(tagName[0])
        const processFunction = isCapitalized ? self.processViewNode : self.processNormalNode
        processFunction.apply(self, [nodePath, node, tagName])
      }
      node.childNodes.forEach(processNode)
      nodePath.pop()
    }
    
    const nodePath = []    // The path of current node recursion
    processNode(this.dom)
  }
  createStatementFor__bv() {
    const lines = ['view.root = wrap(`' + removeRedRunnerCode(this.dom) + '`);']

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
    this.statementFor__bv = addPrototypeFunction(this.className, '__bv', 'view, wrap', body)
  }
  createStatementFor__wc() {
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
  createStatementFor__wq() {
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
    let {args, saveAs} = findRedRunnerAtts(node)
    const lines = this.buildMethodLines
    const constructorStr = args? `view.nest(${tagName}, ${args})` : `view.nest(${tagName})`;
    
    if (saveAs) {
      lines.push(`let ${saveAs} = ${constructorStr};`)
      lines.push(`view.__rn(${lookupArgs(nodePath)}, ${saveAs});`)
      this.domObjectLines.push(`${saveAs}: ${saveAs},`)
    } else {
      lines.push(`view.__rn(${lookupArgs(nodePath)}, ${constructorStr});`)
    }
  }
  processNormalNode(nodePath, node, tagName) {
    let {saveAs, on, watch} = findRedRunnerAtts(node)
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
    if (on) {
      implicitSave()
      // We can use a chained call on the wrapper because it returns "this"
      chainedCalls = `.on('${on.event}', ${on.callback})`
    }
    if (saveAs) {
      this.domObjectLines.push(`${saveAs}: view.${getWrapperCall(nodePath)}${chainedCalls},`)
    }
  }

  /**
   * Adds a watch, creating both the callback and the query functions.
   *
   * @param {object} watch An object of shape {name, convert, target}
   * @param {string} saveAs The name to which the wrapper is to be saved. 
   *
   */
  addNodeWatch(watch, saveAs) {
    let callbackStatement, callbackBody, wrapper = `this.dom.${saveAs}`
    if (watch.target) {
      const targetString = parseTarget(watch.target)
      if (watch.raw) {
        callbackBody = `${wrapper}.${targetString}${watch.raw})`
      } else if (watch.convert) {
        callbackBody = `${wrapper}.${targetString}${watch.convert}(n, o))`
      } else {
        callbackBody = `${wrapper}.${targetString}n)`
      }
    } else {
      // assume convert is provided
      callbackBody = `${watch.convert}(n, o, ${wrapper})`
    }
    callbackStatement = ['function(n, o) {', callbackBody, '},'].join(EOL)
    this.getWatchCallbackItems(watch.name).push(callbackStatement)
    this.watchQueryItems[watch.name] = `function() {return ${watch.name}}`
  }
  // Return array
  getWatchCallbackItems(name) {
    if (!this.watchCallbackItems.hasOwnProperty(name)) {
      this.watchCallbackItems[name] = []
    }
    return this.watchCallbackItems[name]
  }
  getUniqueVarName() {
    this.randVarCount ++
    return '__' + this.randVarCount
  }
}

/** 
 * Returns the statements as a list of strings.
 */
function generateStatements(viewData) {
  const viewProcessor = new ViewProcessor(viewData)
  const names = ['statementFor__bv', 'statementFor__wc', 'statementFor__wq']
  viewProcessor.processView()
  statements = []
  names.forEach(s => {
    if (viewProcessor[s]) {
      statements.push(viewProcessor[s])
    }
  })
  return statements
}

module.exports = {generateStatements}