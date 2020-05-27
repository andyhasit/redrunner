const {c, EOL} = require('../utils/constants')
const {addPrototypeField, addPrototypeFunction, addPrototypeObject} = require('../utils/javascript')
const {ViewClassParser} = require('./view-class-parser')

/**
 * A class for generating all the statements to be added to a RedRunner view.
 */
class StatementBuilder {
  constructor(viewData, parsedData) {
    this.cloneNode = viewData.cloneNode
    this.className = viewData.className
  	this.parsedData = parsedData
  }
  generateStatements() {
    // Return only statements which contain something...
    return [
	    this.build__bv(),
	    this.build__cn(),
	    this.build__ht(),
	    this.build__wc(),
	    this.build__wq()
    ].filter(s => s)
  }
  build__bv() {
    const lines = []
    lines.push(`view.__bd(prototype, ${this.cloneNode});`)

    // Add remaining lines (must come before dom!)
    this.parsedData.buildMethodLines.forEach(n => lines.push(n))

    // Add this.dom definition
    if (this.parsedData.domObjectLines.length > 0) {
      lines.push('view.dom = {')
      this.parsedData.domObjectLines.forEach(n => lines.push(n))
      lines.push('};')
    } else {
      lines.push('view.dom = {};')
    }
    const body = lines.join(EOL)
    return addPrototypeFunction(this.className, '__bv', 'view, prototype', body)
  }
  build__cn() {
    if (this.cloneNode) {
      return addPrototypeField(this.className, '__cn', 'undefined')
    }
  }
  build__ht() {
    // This only removes redrunner atts, the inlines we removed in place.
    // Perhaps change this to make behaviour consistent.
    return addPrototypeField(this.className, '__ht', `'${this.parsedData.cleanHTML}'`)
  }
  build__wc() {
    const lines = []
    for (let [key, value] of Object.entries(this.parsedData.watchCallbackItems)) {
      lines.push(`'${key}': [`)
      value.forEach(e => lines.push(e))
      lines.push(`],`)
    }
    if (lines.length) {
      const body = lines.join(EOL)
      return addPrototypeObject(this.className, '__wc', body)
    }
  }
  build__wq() {
    const lines = []
    for (let [key, value] of Object.entries(this.parsedData.watchQueryItems)) {
      lines.push(`'${key}': ${value},`)
    }
    if (lines.length) {
      const body = lines.join(EOL)
      return addPrototypeObject(this.className, '__wq', body)
    }
  }
}

function generateStatements(viewData) {
  const parser = new ViewClassParser(viewData)
  const builder = new StatementBuilder(viewData, parser.parse())
  return builder.generateStatements()
}

module.exports = {generateStatements}