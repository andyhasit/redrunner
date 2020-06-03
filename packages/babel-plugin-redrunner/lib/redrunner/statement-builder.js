const {c, EOL} = require('../utils/constants')
const {
  addPrototypeArray,
  addPrototypeField,
  addPrototypeFunction,
  addPrototypeObject
} = require('../utils/javascript')
const {ViewClassParser} = require('./view-class-parser')

/**
 * Generates the statements.
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
    return addPrototypeField(this.className, '__ht', `'${this.parsedData.cleanHTML}'`)
  }
  build__wc() {
    const lines = []
    this.parsedData.watchCallbackItems.forEach(entry => {
      let {wrapper, shield, callbacks} = entry
      let callbackLines = ['{']
      for (let [key, value] of Object.entries(callbacks)) {
        callbackLines.push(`'${key}': ${value}`)
      }
      callbackLines.push(`}`)
      lines.push(`{wrapper: '${wrapper}', shield: ${shield}, callbacks: ${callbackLines.join(EOL)}},`)
    })
    const body = lines.join(EOL)
    return addPrototypeArray(this.className, '__wc', body)
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