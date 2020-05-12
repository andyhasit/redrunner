/* Common imports */
const EOL = require('os').EOL
const htmlparse = require('node-html-parser')

/* The RedRunner attributes */
const saveAsAttName = 'as'
const argsAttName = 'args'
const redrunnerAtts = [saveAsAttName, argsAttName]

const c = console

module.exports = {
  EOL,
  c,
  htmlparse,
  saveAsAttName,
  argsAttName,
  redrunnerAtts
}