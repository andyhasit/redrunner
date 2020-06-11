const c = console
const {EOL} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {groupArray} = require('../utils/javascript')
const {DomWalker} = require('./dom_walker.js')
const {extractNodeData} = require('./extract_node_data')
const {
  buidlWatchCallbackLine,
  getLookupArgs,
  getWatchQueryCallBack,
  isNestedView
} = require('./syntax')
const {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./statement_builders')

/**
 * Builds all the generated statements for a RedRunner View.
 * Deals with:
 *
 *  - Building the fields and methods for the prototype
 *  - Tracking state during the parsing (e.g. next DOMRef, and shielding)
 *
 * Does not deal with:
 *
 *  - generating JS from html syntax.
 */
class ViewStatementBuilder {
  constructor(viewData) {
    this.walker = new DomWalker(viewData.html, nodeInfo => this.processNode(nodeInfo))
    this.className = viewData.className

    this.clone = viewData.clone
    this.config = viewData.config
    this.nextElementRefIndex = 0

    // This is the variable to which the build utils object is added
    this.buildUtils = '__buildUtils__'

    // These are used in the buildMethod
    this.savedElements = new ObjectStatement()
    this.beforeSave = []
    this.afterSave = []

    // These objects build the statements.
    this.htmlString = new ValueStatement()
    this.buildMethod = new FunctionStatement('view, prototype')
    this.watches = new ArrayStatement()
    this.queryCallbacks = new ObjectStatement()
    this.queryCollection = new CallStatement(`${this.buildUtils}.getQueryCollection`)
    this.queryCollection.add(this.queryCallbacks)
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
  	this.walker.parse()
  	this.postParsing()
  	const prefix = `${this.className}.prototype`
		const statements = [
      `var ${this.buildUtils} = ${prefix}.buildUtils;`,
			this.htmlString.buildAssign(`${prefix}.__ht`),
			this.watches.buildAssign(`${prefix}.__wc`),
			this.queryCollection.buildAssign(`${prefix}.queryCollection`),
			this.buildMethod.buildAssign(`${prefix}.__bv`),
		]
		if (this.clone) {
			statements.push(new ValueStatement('undefined').buildAssign(`${prefix}.__cn`))
		}
		return statements.reverse()
	}
	/**
	 * Consolidates various bits after parsing.
	 */
	postParsing() {
		this.buildMethod.add(`view.__bd(prototype, ${this.clone})`)
		this.beforeSave.forEach(i => this.buildMethod.add(i))
		this.buildMethod.add(this.savedElements.buildAssign('view.dom'))
		this.afterSave.forEach(i => this.buildMethod.add(i))
		// We do this at the end as the dom has been changed
		this.htmlString.set(`'${stripHtml(this.walker.dom.toString())}'`)
	}
  /**
   * Gets passed to the DomWalker, which calls this for every node.
   */
  processNode(nodeInfo) {
  	const {nodePath, node, tagName} = nodeInfo
    const nodeData = extractNodeData(node, this.config, this.walker)
    if (nodeData) {
      let {afterSave, beforeSave, initialProps, saveAs, shieldQuery, reverseShield, watches} = nodeData

      // Use the saveAs supplied, or get a sequential one
      saveAs = saveAs ? saveAs : this.getNextElementRef()

      if (isNestedView(nodeInfo)) {
        this.saveNestedView(nodePath, saveAs, nodeData, tagName, initialProps)
      } else {
        this.saveWrapper(nodePath, saveAs, nodeData)
      }

      // Ensure the shieldQuery gets added
      if (shieldQuery) {
        this.addWatchQueryCallback(shieldQuery)
      }
      // Use the shieldQuery supplied, undefined (must set as string here)
      shieldQuery = shieldQuery ? `'${shieldQuery}'` : 'undefined'


      // Squash array to object
      watches = groupArray(watches, 'property', watch => {
      	let {converter, target, raw} = watch
      	return buidlWatchCallbackLine(saveAs, converter, target, raw) // TODO: extract this
      })

      // Group statements into single function
      let allCallbacks = new ObjectStatement()
      for (let [property, statements] of Object.entries(watches)) {
      	this.addWatchQueryCallback(property)
      	let callback = new FunctionStatement('n, o')
      	statements.forEach(s => callback.add(s))
        allCallbacks.add(property, callback)
      }
      let watchCall = new CallStatement(`${this.buildUtils}.getWatch` , [
      	`'${saveAs}'`,
      	shieldQuery,
        reverseShield.toString(),
      	allCallbacks
      ])
      this.watches.add(watchCall)
    } else if (isNestedView(nodeInfo)) {
      this.beforeSave.push(`view.__rn(${getLookupArgs(nodePath)}, view.nest(${tagName}));`)
    }
  }
  /**
   * Add a saved Element.
   */
  saveWrapper(nodePath, saveAs, nodeData) {
    this.saveElement(saveAs, nodeData.wrapperInit(nodePath), nodeData.chainedCalls)
  }
  saveNestedView(nodePath, saveAs, nodeData, tagName, initialProps) {
    let constructorStr =  `view.nest(${tagName})`
    if (initialProps) {
      constructorStr += `.setProps(${initialProps})`
    }
    // Save as local variable, just use "saveAs" as a variable name.
    this.beforeSave.push(`var ${saveAs} = ${constructorStr};`)
    // Replace the node
    this.beforeSave.push(`view.__rn(${getLookupArgs(nodePath)}, ${saveAs});`)
    // Save element
    this.saveElement(saveAs, saveAs, nodeData.chainedCalls)
  }
  saveElement(saveAs, initCall, chainedCalls) {
    const chainedCallStatement = chainedCalls.length ? '.' + chainedCalls.join('.') : ''
    this.savedElements.add(saveAs, `${initCall}${chainedCallStatement}`)
  }
  addWatchQueryCallback(property) {
  	const callback = getWatchQueryCallBack(property)
  	if (callback) {
      this.queryCallbacks.add(property, callback)
    }
  	// TODO: also initiate the previous values object?
  }
  /**
   * Gets next name for saving elements.
   */
  getNextElementRef() {
    this.nextElementRefIndex ++
    return `_${this.nextElementRefIndex}_`
  }
}

module.exports = {ViewStatementBuilder}