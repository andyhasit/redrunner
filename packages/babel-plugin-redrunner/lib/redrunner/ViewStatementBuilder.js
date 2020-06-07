const c = console
const {EOL} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
const {groupArray} = require('../utils/javascript')
const {DOMWalker} = require('./DOMWalker.js')
const {extractNodeData} = require('./extractNodeData')
const {buidlCallbackStatement, getWatchQueryCallBack} = require('./syntax')
const {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./StatementBuilders')

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
    this.walker = new DOMWalker(viewData.html, nodeInfo => this.processNode(nodeInfo))
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
    this.queryCache = new CallStatement(`${this.buildUtils}.getQueryCache`)
    this.queryCache.add(this.queryCallbacks)
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
			this.queryCache.buildAssign(`${prefix}.queryCache`),
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
   * Gets passed to the DOMWalker, who calls this at every node.
   * Simply punts the call to the appropriate method depending on node type.
   */
  processNode(nodeInfo) {
  	const isTagCapitalized = /[A-Z]/.test(nodeInfo.tagName[0])
    const processFunction = isTagCapitalized ? this.processViewNode : this.processNormalNode
    processFunction.apply(this, [nodeInfo])
  }
  processViewNode(nodeInfo) {
  	const {nodePath, node, tagName} = nodeInfo
    let {props, saveAs} = extractNodeData(node, this.config, this.walker)
    const constructorStr = props? `view.nest(${tagName}, ${props})` : `view.nest(${tagName})`;
	  if (saveAs) {
	    this.beforeSave.push(`let ${saveAs} = ${constructorStr};`)
	    this.beforeSave.push(`view.__rn(${lookupArgs(nodePath)}, ${saveAs});`)
	    this.saveElement(saveAs, saveAs)
	  } else {
	    this.beforeSave.push(`view.__rn(${lookupArgs(nodePath)}, ${constructorStr});`)
	  }
  }
  processNormalNode(nodeInfo) {
  	const {nodePath, node, tagName} = nodeInfo
    const nodeData = extractNodeData(node, this.config, this.walker)
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, shieldQuery, reverseShield, watches} = nodeData

      // Use the saveAs supplied, or get a sequential one
      saveAs = saveAs ? saveAs : this.getNextElementRef()

      // Ensure the shieldQuery gets added
      if (shieldQuery) {
        this.addWatchQueryCallback(shieldQuery)
      }
      // Use the shieldQuery supplied, undefined (must set as string here)
      shieldQuery = shieldQuery ? `'${shieldQuery}'` : 'undefined'

      // Save the element.
      this.saveElement(nodePath, saveAs, nodeData)

      // Squash array to object
      watches = groupArray(watches, 'property', watch => {
      	let {converter, target, raw} = watch
      	return buidlCallbackStatement(saveAs, converter, target, raw) // TODO: extract this
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
    }
  }
  addWatchQueryCallback(property) {
  	const callback = getWatchQueryCallBack(property)
  	if (callback) {
      this.queryCallbacks.add(property, callback)
    }
  	// TODO: also initiate the previous values object?
  }
  /**
   * Add a saved Element.
   */
  saveElement(nodePath, saveAs, nodeData) {
    let {chainedCalls} = nodeData
    const wrapperInit = nodeData.wrapperInit(nodePath)
    const chainedCallStatement = chainedCalls.length ? '.' + chainedCalls.join('.') : ''
    this.savedElements.add(saveAs, `${wrapperInit}${chainedCallStatement}`)
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