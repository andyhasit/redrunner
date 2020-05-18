/*
The code for generating the additional statements
*/

const htmlparse = require('node-html-parser')
const {c, EOL} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {addPrototypeFunction, addPrototypeObject} = require('../utils/javascript')
const {findRedRunnerAtts, removeRedRunnerCode} = require('./special-atts')
const {lookupArgs, getWrapperCall} = require('./views')
const {findInlineCalls} = require('./inline')


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
    const implicitSave = _ => saveAs = saveAs ?  saveAs : this.getRandVarName()
    const inlineCalls = findInlineCalls(node)
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
  addNodeWatch(watch, name) {
    /*
    'count': [
      function(n, o) {
        this.__gw([0]).text(n)
      },
      
      with target but no convert:
        this.__gw([0]).text(n)
      with target and convert:
        this.__gw([0]).text(convert(n, o))
      no target (implies convert):
        convert(n, o, w)
      }
    ]
    */
    let  callbackStatement, callbackBody, wrapper = `this.dom.${name}`
    if (watch.target) {
      if (watch.convert) {
        callbackBody = `${wrapper}.${watch.target}(${watch.convert}(n, o))`
      } else {
        callbackBody = `${wrapper}.${watch.target}(n)`
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
  getRandVarName() {
    this.randVarCount ++
    return '__' + this.randVarCount
  }
}


/** Returns the statements as a list of strings.
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