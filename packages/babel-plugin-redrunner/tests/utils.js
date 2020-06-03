import {c, htmlparse} from '../lib/utils/constants'
import diff from 'jest-diff'

const EOL = require('os').EOL
const babel = require('@babel/core')
const redrunnerPlugin = require('../lib/index')

/**
 * Parses node from html string.
 */
function getNode(html) {
  return htmlparse.parse(html).childNodes[0]
}

/**
 * A matcher for jest tests which checks that two strings match with whitespace nullified.
 */
expect.extend({
  toMatch(received, expected) {
    received = received.replace(/\n/g, "")
    expected = expected.replace(/\n/g, "")
    const pass = received === expected
    const passMessage = () => 'OK'
    const failMessage = () => {
        const diffString = diff(expected, received, {
          expand: this.expand,
        });
        return this.utils.matcherHint('.toBe') + (diffString ? `\n\nDifference:\n\n${diffString}` : '')
      }
    const message = pass ? passMessage : failMessage
    return {actual: received, message, pass}
  },
});


/**
 * Strips blank lines from text.
 */
function stripBlankLines(text) {
  return text.split(EOL).filter(line => line.trim() !== '').join(EOL);
}




const transformOptions = {plugins: [
  // Enable class properties syntax without touching
  ["@babel/plugin-syntax-class-properties"],
  [redrunnerPlugin],
  // Transforms them
  ["@babel/plugin-proposal-class-properties"]
]};

function transform(src) {
  return babel.transform(src, transformOptions).code
}


module.exports = {c, EOL, getNode, transform, stripBlankLines}
