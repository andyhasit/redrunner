const {c, EOL, htmlparse} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {findRedRunnerAtts, removeRedRunnerCode} = require('./special-atts')
const {buidlCallbackStatement, expandShorthand, lookupArgs} = require('./views')
const {extractNodeData} = require('./parse-node')
const {config} = require('./config')

/**
 * A class for generating all the statements to be added to a RedRunner view.
 */
class ViewClassParser {
  constructor(viewData) {
    let {className, html} = viewData
    this.className = className
    this.strippedHtml = stripHtml(html)
    this.buildMethodLines = []    // The method lines, as code
    this.domObjectLines = []      // The lines for this.dom = {}
    this.watchCallbackItems = []  // Entries for the __wc object
    this.watchQueryItems = {}     // Entries for the __wq object
    this.randVarCount = 0
    this.dom = undefined
    this.currentNode = undefined
  }
  /**
   * The entry call.
   */
  parse() {
    this.dom = htmlparse.parse(this.strippedHtml)
    const nodePath = []    // The path of current node recursion

    /**
     * Called recursively to process each node in the DOM
     */
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

    processNode(this.dom)
    return {
      buildMethodLines: this.buildMethodLines,
      domObjectLines: this.domObjectLines,
      watchCallbackItems: this.watchCallbackItems,
      watchQueryItems: this.watchQueryItems,
      // This only removes redrunner atts, the inlines we removed in place.
      // Perhaps change this to make behaviour consistent.
      cleanHTML: removeRedRunnerCode(this.dom)
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
    const nodeData = extractNodeData(node, config)
    const callbacks = {}
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, watches} = nodeData
      saveAs = saveAs ?  saveAs : this.getUniqueVarName()
      watches.forEach(watch => {
        let {property, converter, target, raw} = watch
        // Add watch query (idempotent)
        this.addWatchQuery(property)

        // Squash statements for all callbacks into one function.
        let statement = buidlCallbackStatement(saveAs, converter, target, raw)
        if (!callbacks.hasOwnProperty(property)) {
          callbacks[property] = []
        }
        callbacks[property].push(statement)
      })

      for (let [property, statements] of Object.entries(callbacks)) {
        let functionLines = statements.join(EOL)
        let functionString = ['function(n, o) {', functionLines, '},'].join(EOL)
        callbacks[property] = functionString
      }

      this.watchCallbackItems.push({wrapper:saveAs, shield: 0, callbacks: callbacks})
      this.addSave(nodePath, saveAs, nodeData)
    }
  }
  addWatchQuery(property) {
    if (property !== '*') {
      if (property === '' || property === undefined) {
        this.watchQueryItems[property] = `function() {return null}`
      } else {
        this.watchQueryItems[property] = `function() {return ${expandShorthand(property)}}`
      }
    }
  }
  /**
   * Builds a single line of the callback statement.
   */
  addSave(nodePath, saveAs, nodeData) {
    let {chainedCalls} = nodeData
    // TODO: build chainedCallStatement, also maybe not build whole thing up here?
    const wrapperInit = nodeData.wrapperInit(nodePath)
    const chainedCallStatement = chainedCalls.join('.')
    this.domObjectLines.push(`${saveAs}: ${wrapperInit}${chainedCallStatement},`)
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