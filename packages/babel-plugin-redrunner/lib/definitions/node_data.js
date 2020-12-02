const {eventCallbackArgs, componentRefInBuild, watchArgs, watchCallbackArgs, watchCallbackArgsAlways} = require('../constants')
const {replaceArgs} = require('../utils/misc')
const {Watcher} = require('./watcher')

/**
 * A NodeData object is created for every HTML node with directives.
 * Its data will be used to generate statements on the component.
 * It exposes methods which enable directives to set that data.
 * It also contains the directive syntax rules (expansion etc...)
 */
class NodeData {
  constructor(node, processAsStub) {
    this.node = node
    this.processAsStub = processAsStub // whether the whole html declaration is a stub
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
  /**
   * Creates a watch on this node.
   * 
   * @param {string} watch - the field or function to watch.
   * @param {string} [converter] - the value to pass to method, or free function call if no wrapperMethod supplied.
   * @param {string} [wrapperMethod] - the method on the wrapper (may use "@attName" syntax).
   * @param {string} [extraArg] - And extra argument to pass to the wrapperMethod
   * @param {string} [lookup] - name of the lookup to use. 
   */
  addWatch(watch, converter, wrapperMethod, extraArg, lookup) {
    this.watches.push(new Watcher(this.expandValueSlot(watch), this.expandValueSlot(converter), wrapperMethod, extraArg, lookup))
  }
  /**
   * Creates an event listener on this node.
   * Slot will be expanded.
   * 
   * @param {string} event 
   * @param {string} slot 
   */
  addEventListener(event, slot) {
    const callback = this.buildEventListenerCallback(slot)
    this.chainedCalls.push(`on('${event}', ${callback})`)
  }
  /**
   * Builds the callback function for an event handler.
   * Replaces c & p arguments with variables from the outer scope
   * if present as these are not provided by the wrapper.
   * 
   * @param {string} slot 
   */
  buildEventListenerCallback(slot) {
    const isRawSlot = slot.startsWith('(')
    let body = this.expandValueSlot(slot, true)
    if (!isRawSlot) {
      body = replaceArgs(body, 'c', componentRefInBuild)
      body = replaceArgs(body, 'p', componentRefInBuild + '.props')
    }
    return `function(${eventCallbackArgs}) {${body}}`
  }
  /**
   * Builds the call to create a cache for child views.
   * 
   * @param {string} cacheDef - the name of the view class to cache, or if it
   * starts with @ then it is the path to a cache object (e.g. @..sharedCache ).
   * @param {string} cacheKey - the field on the props to cache by.
   */
  buildCacheInit (cacheDef, cacheKey){
    let cacheStatement
    if (cacheDef.startsWith('@')) {
      cacheStatement = this.parseWatchedValueSlot(cacheDef.substr(1))
    } else {
      if (cacheKey) {
        const keyFn = `function(props) {return props.${cacheKey}}`
        cacheStatement = `view.__kc(${cacheDef}, ${keyFn})`
      } else {
        cacheStatement = `view.__sc(${cacheDef})`
      }
    }
    return cacheStatement
  }
  /**
   * Expands a value slot.
   * 
   */
  expandValueSlot(slot, inBuild=false) {
    if (slot && (slot !== '')) {
      // If it starts with () then we don't expand dots (treat as raw code).
      if (slot.startsWith('(')) {
        if (slot.endsWith(')')) {
          return slot.substr(1, slot.length - 2)
        } else {
          throw 'Value slot starting with "(" must also end with ")"'
        }
      }
      return this.expandDots(slot, inBuild)
    }
  }
  /**
   * Expands a value field's dots.
   * Works differently if it is a callback in Build.
   */
  expandDots(field, inBuild=false) {
    if (this.processAsStub) {
      if (inBuild) {
        if (field.startsWith('..')) {
          return `${componentRefInBuild}.parent.props.` + field.substr(2)
        } else if (field.startsWith('.')) {
          return `${componentRefInBuild}.parent.` + field.substr(1)
        }
      } else {
        if (field.startsWith('..')) {
          return `c.parent.props.` + field.substr(2)
        } else if (field.startsWith('.')) {
          return `c.parent.` + field.substr(1)
        }
      }
    } else {
      if (inBuild) {
        if (field.startsWith('..')) {
          return `${componentRefInBuild}.props.` + field.substr(2)
        } else if (field.startsWith('.')) {
          return `${componentRefInBuild}.` + field.substr(1)
        }
      } else {
        if (field.startsWith('..')) {
          return `p.` + field.substr(2)
        } else if (field.startsWith('.')) {
          return `c.` + field.substr(1)
        }
      }
    }
    // if (field.startsWith('..')) {
    //   return this.processAsStub ? 'c.parent.props.' + field : 'this.props.' + field
    // } else if (field.startsWith('.')) {
    //   return this.processAsStub ? 'this.parent.' + field.substr(1) : 'this.' + field.substr(1)
    // }
    return field
  }

  /**
   * Expands a single inline watched property like ".name" in "<i>{.name}</i>".
   * If it ends with ? then call it with watch callback args.
   * 
   * @param {string} field 
   */
  expandInlineWatchedProperty(field) {
    return this.expandDots(addCallIfCallable(field, watchCallbackArgsAlways))
  }

  /**
   * Expands the props field. If ends with ? then call it with (this)
   * 
   * @param {string} field 
   */
  expandProps(field) {
    return this.expandDots(addCallIfCallable(field, 'this')) //TODO: not viewArg?
  }

  /**
   * Expands the watched property slot, including the expandDots.
   * Assumes field not function.
   *
   *   undefined  >  undefined
   *   ''         >  undefined
   *   foo        >  this.props.foo
   *   foo!       >  this.props.foo
   *   foo?       >  this.props.foo(props, component)
   *   .foo       >  this.foo
   *   ..foo      >  foo
   *
   */
  parseWatchedValueSlot(property) {
    // TODO: check why I still need this....



    if (property === '*') {
      return '*'
    }
    if (property === '' || property === undefined) {
      return undefined
    }

    // Remove ! because it's just the user explicity marking this a field
    property = property.endsWith('!') ? property.slice(0, -1) : property

    const expanded = this.expandDots(property)
    return property.endsWith('?') ? expanded.slice(0, -1) + `(this.props, this)` : expanded
  }
}

/**
 * If field ends with '?' then convert in into a call statement with callArgs.
 * If it doesn't then return as is.
 * It it ends with '.' then return without '.'
 * 
 * @param {string} field 
 * @param {string} callArgs 
 */
const addCallIfCallable = (field, callArgs) => {
  if (field.endsWith('.')) {
    field = field.slice(0, -1)
  }
  if (field.endsWith('?')) {
    field = field.slice(0, -1) + `(${callArgs})`
  }
  return field
}

module.exports = {NodeData}