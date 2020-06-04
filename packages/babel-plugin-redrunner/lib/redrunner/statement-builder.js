const babel = require('@babel/core')
const {c, EOL} = require('../utils/constants')


class BaseStatement {
  /**
   * Builds the babel AST for an assignemen statement of the value.
   * Note that babel does its own adjustments with spaces, commas etc...
   */
  buildAssign(name) {
    let statement = `${name} = ${this.buildValue()};`
    return babel.template.ast(statement)
  }
}


class ArrayStatement extends BaseStatement {
  constructor() {
    this.items = []
  }
  add(value) {
    this.items.push(value)
  }
  buildValue() {
    const lines = ['[']
    this.items.forEach(i => {
      lines.push(`${value},`)
    })
    lines.push(']')
    return lines.join(EOL)
  }
}


class FunctionStatement extends BaseStatement {
  constructor(argString) {
    this.argString = argString
    this.items = []
  }
  add(value) {
    this.items.push(value)
  }
  buildValue() {
    const lines = [`function (${argString}) {`]
    this.items.forEach(i => {
      lines.push(`${value},`)
    })
    lines.push('}')
    return lines.join(EOL)
  }
}


class ObjectStatement extends BaseStatement {
  constructor() {
    this.entries = {}
  }
  add(key, value) {
    this.entries[key] = value
  }
  buildValue() {
    const lines = ['{']
    for (let [key, value] of Object.entries(this.entries)) {
      lines.push(`'${key}': ${value},`)
    }
    lines.push('}')
    return lines.join(EOL)
  }
}


class ValueStatement extends BaseStatement {
  constructor() {
    this.value = 'undefined'
  }
  set(value) {
    this.value = value
  }
  buildValue() {
    return this.value
  }
}

module.exports = {
  ArrayStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
}