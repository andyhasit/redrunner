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


const vars = {
  buildUtils: '__bu__',
  getWatch: '_wt',
  getQueryCollection: '_qc',
}

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
    this.savedWatchCallArgs = []

    // These are used in the buildMethod
    this.savedElements = new ObjectStatement()
    this.beforeSave = []
    this.afterSave = []

    // These objects build the statements.
    this.htmlString = new ValueStatement()
    this.buildMethod = new FunctionStatement('view, prototype')
    this.watches = new ArrayStatement()
    this.queryCallbacks = new ObjectStatement()
    this.nestedViewProps = new ObjectStatement()
    this.queryCollection = new CallStatement(`${vars.buildUtils}.${vars.getQueryCollection}`)
    this.queryCollection.add(this.queryCallbacks)
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
  	this.walker.parse()
  	this.postParsing()
    const protoVar = `_${this.className}Prototype`
		const statements = [
      `var ${protoVar} = ${this.className}.prototype;`,
      `var ${vars.buildUtils} = ${protoVar}.__bu;`,
			this.htmlString.buildAssign(`${protoVar}.__ht`),
			this.watches.buildAssign(`${protoVar}.__wc`),
			this.queryCollection.buildAssign(`${protoVar}.__qc`),
      this.nestedViewProps.buildAssign(`${protoVar}.__ip`),
			this.buildMethod.buildAssign(`${protoVar}.__bv`),
		]
		if (this.clone) {
			statements.push(new ValueStatement('undefined').buildAssign(`${protoVar}.__cn`))
		}
		return statements.reverse()
	}
	/**
	 * Consolidates various bits after parsing.
	 */
	postParsing() {
    this.setShieldCounts()
		this.buildMethod.add(`view.__bd(prototype, ${this.clone})`)
		this.beforeSave.forEach(i => this.buildMethod.add(i))
		this.buildMethod.add(this.savedElements.buildAssign('view.dom'))
		this.afterSave.forEach(i => this.buildMethod.add(i))
		// We do this at the end as the dom has been changed
		this.htmlString.set(`'${stripHtml(this.walker.dom.toString())}'`)
	}
  /**
   * Sets the shieldCounts, which has to be done after parsing as nodes
   * can't know how many child nodes they will have at point of being
   * parsed.
   */
  setShieldCounts() {
    /*
    Loop over each and determine from path whether wrapper is a a child, in which case
    all parents get bumped up.
    Farm this out to a function which takes

    this.savedWatchCallArgs.map(i => i.nodePath)

    and returns array of shieldCounts to apply,
    which we then set as the

    // [0, 0, 0]

    */
    const shieldCountArgIndex = 3
    c.log(this.savedWatchCallArgs)
  }
  /**
   * Saves the watchCallArgs against the nodePath, which well use in watchCallArgs
   */
  saveWatchCallArgs(nodePath, watchCallArgs) {
    // The first element is undefined, which we don't need here.
    nodePath = nodePath.slice(1)
    this.savedWatchCallArgs.push({nodePath, watchCallArgs})
  }
  /**
   * Gets passed to the DomWalker, which calls this for every node.
   */
  processNode(nodeInfo) {
  	const {nodePath, node, tagName} = nodeInfo
    const nodeData = extractNodeData(node, this.config, this.walker)
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, props, shieldQuery, reverseShield, watches} = nodeData

      // Use the saveAs supplied, or get a sequential one
      saveAs = saveAs ? saveAs : this.getNextElementRef()

      if (isNestedView(nodeInfo)) {
        this.saveNestedView(nodePath, saveAs, nodeData, tagName, props)
      } else {
        this.saveWrapper(nodePath, saveAs, nodeData)
      }

      // Ensure the shieldQuery gets added
      // This is the query to determine whether the wrappers should shield
      // nested wrappers
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
      const allCallbacks = new ObjectStatement()
      for (let [property, statements] of Object.entries(watches)) {
      	this.addWatchQueryCallback(property)
      	let callback = new FunctionStatement('n, o')
      	statements.forEach(s => callback.add(s))
        allCallbacks.add(property, callback)
      }

      // shieldCount is the number of wrappers to shield, which will equate to the
      // number of wrappers nested underneath, which we have to calculate postParsing
      // so we just set it to 0 for now.
      const shieldCount = 0
      const watchCallArgs = [
        `'${saveAs}'`,
        shieldQuery,
        reverseShield.toString(),
        shieldCount,  // shieldCount is at position 3 - if this changes we must change setShieldCounts!
        allCallbacks
      ]
      // We save this as we're going to need it postParsing to set the shieldCount
      // Must slice the nodePath!
      this.saveWatchCallArgs(nodePath.slice(), watchCallArgs)

      const watchCall = new CallStatement(`${vars.buildUtils}.${vars.getWatch}`, watchCallArgs)
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
  saveNestedView(nodePath, saveAs, nodeData, tagName, props) {
    this.nestedViewProps.add(saveAs, new FunctionStatement('', [`return ${props}`]))
    // let constructorStr =  `view.nest(${tagName})`
    // // Save as local variable, just use "saveAs" as a variable name.
    // this.beforeSave.push(`var ${saveAs} = ${constructorStr};`)
    // // Replace the node
    // this.beforeSave.push(`view.__rn(${getLookupArgs(nodePath)}, ${saveAs});`)

    const initCall = `view.__ni(${getLookupArgs(nodePath)}, ${tagName})`
    // Save element
    this.saveElement(saveAs, initCall, nodeData.chainedCalls)
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