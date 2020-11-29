const {getLookupArgs, stripHtml} = require('../utils/dom')
const {extractShieldCounts, groupArray, isUnd} = require('../utils/misc')
const {viewVar, watchCallbackArgs, watchCallbackArgsAlways} = require('../utils/constants')
const {DomWalker} = require('../parse/dom_walker.js')
const {extractNodeData} = require('../parse/parse_node')
const {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./statement_builders')
const {buildWatchCallbackBody} = require('./watches')

const re_lnu = /^\w+$/; // letters_numbers_underscores

const vars = {
  prototypeVariable: 'p',
  getWatch: '__wa',
  getLookup: '__lu',
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
class CodeGenerator {
  constructor(viewData) {
    this.walker = new DomWalker(viewData.html, nodeInfo => this.processNode(nodeInfo))
    this.className = viewData.className

    this.clone = viewData.clone
    this.asStub = viewData.asStub
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
    this.lookup = new CallStatement(`${vars.prototypeVariable}.${vars.getLookup}`)
    this.lookup.add(this.queryCallbacks)
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
    this.walker.parse()
    this.postParsing()
    const statements = [
      `var ${vars.prototypeVariable} = ${this.className}.prototype;`,
      this.htmlString.buildAssign(`${vars.prototypeVariable}.__ht`),
      this.watches.buildAssign(`${vars.prototypeVariable}.__wc`),
      this.lookup.buildAssign(`${vars.prototypeVariable}.__qc`),
      this.nestedViewProps.buildAssign(`${vars.prototypeVariable}.__ip`),
      this.buildMethod.buildAssign(`${vars.prototypeVariable}.__bv`),
    ]
    if (this.clone) {
      statements.push(new ValueStatement('undefined').buildAssign(`${vars.prototypeVariable}.__cn`))
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
    this.buildMethod.add(this.savedElements.buildAssign('view.el'))
    this.afterSave.forEach(i => this.buildMethod.add(i))
    // We do this at the end as the dom has been changed
    const convertedHTML = this.buildHtmlString(this.walker.dom.outerHTML)
    this.htmlString.set(`'${convertedHTML}'`)
  }
  /**
   * Converts the raw HTML text from the DOM
   */
  buildHtmlString(rawHtml) {
    return stripHtml(rawHtml).replace(/'/g, "\\'")
  }
  /**
   * Sets the shieldCounts, which has to be done after parsing as nodes
   * can't know how many child nodes they will have at point of being
   * parsed.
   */
  setShieldCounts() {
    const shieldCountArgIndex = 3
    const nodePathOfEachWatchCall = this.savedWatchCallArgs.map(i => i.nodePath)
    const shieldCountForEachWatchCall = extractShieldCounts(nodePathOfEachWatchCall)
    for (const [i, argSet] of this.savedWatchCallArgs.entries()) {
      argSet.watchCallArgs[shieldCountArgIndex] = shieldCountForEachWatchCall[i]
    }
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
    const nodeData = extractNodeData(node, this.config, this.walker, this.asStub)
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, props, shieldQuery, reverseShield, watches, stubName, replaceWith} = nodeData

      if (stubName) {
        this.saveStub(stubName, nodePath)
        return
      }

      // Use the saveAs supplied, or get a sequential one
      saveAs = saveAs ? saveAs : this.getNextElementRef()

      if (replaceWith) {
        this.saveNestedView(nodePath, saveAs, nodeData, replaceWith, props, replaceWith)
      } else {
        this.saveWrapper(nodePath, saveAs, nodeData)
      }

      // Ensure the shieldQuery gets added
      // This is the query to determine whether the wrappers should shield
      // nested wrappers
      if (shieldQuery) {
        this.addWatchQueryCallback(nodeData, shieldQuery)
      }
      // Use the shieldQuery supplied, 0 (must set as string here)
      shieldQuery = shieldQuery ? `'${shieldQuery}'` : '0'

      // Squash array to object with callbacks
      watches = groupArray(watches, 'property', function(watch) {
        return buildWatchCallbackBody(nodeData, saveAs, watch)
      })

      // Group statements into single function
      const allCallbacks = new ObjectStatement()
      for (let [property, statements] of Object.entries(watches)) {
        this.addWatchQueryCallback(nodeData, property)
        let callbackArgs = property === '*' ? watchCallbackArgsAlways : watchCallbackArgs
        let callback = new FunctionStatement(callbackArgs)
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

      const watchCall = new CallStatement(`${vars.prototypeVariable}.${vars.getWatch}`, watchCallArgs)
      this.watches.add(watchCall)
    }
  }
  /**
   * Add a saved Element.
   */
  saveWrapper(nodePath, saveAs, nodeData) {
    this.saveElement(saveAs, this.buildWrapperInitCall(nodeData, nodePath), nodeData.chainedCalls)
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
  buildWrapperInitCall(nodeData, nodePath) {
    const path = getLookupArgs(nodePath)
    if (nodeData.wrapperOverride) {
      return nodeData.wrapperOverride
    } else if (nodeData.customWrapperClass) {
      const args = nodeData.customWrapperArgs ? ',' + nodeData.customWrapperArgs : ''
      return `new ${nodeData.customWrapperClass}(view.__fe(${path})${args})`
    }
    return `view.__gw(${path})`
  }
  saveNestedView(nodePath, saveAs, nodeData, tagName, props, replaceWith) {
    const nestedViewClass = replaceWith || tagName
    if (isUnd(props)) {
      props = 'this.props'
    }
    this.nestedViewProps.add(saveAs, new FunctionStatement('', [`return ${props}`]))
    const initCall = `view.__ni(${getLookupArgs(nodePath)}, ${nestedViewClass})`
    this.saveElement(saveAs, initCall, nodeData.chainedCalls)
  }
  saveStub(stubName, nodePath) {
    if (!re_lnu.test(stubName)) {
      this.walker.throw('Stub name may only contain letters numbers and underscores')
    }
    this.nestedViewProps.add(stubName, new FunctionStatement('', ['return this.props']))
    const initCall = `view.__ni(${getLookupArgs(nodePath)}, this.__stubs__${stubName})`
    this.saveElement(stubName, initCall, [])
  }
  saveElement(saveAs, initCall, chainedCalls) {
    const chainedCallStatement = chainedCalls.length ? '.' + chainedCalls.join('.') : ''
    this.savedElements.add(saveAs, `${initCall}${chainedCallStatement}`)
  }
  addWatchQueryCallback(nodeData, property) {
    const callback = nodeData.getWatchQueryCallBack(property)
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
    return `_${this.nextElementRefIndex}`
  }
}

function generateStatements(viewData) {
  const builder = new CodeGenerator(viewData)
  return builder.buildStatements()
}

module.exports = {CodeGenerator, generateStatements}