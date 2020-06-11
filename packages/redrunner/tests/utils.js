const c = console
const {prettyPrint} = require('html')

import diff from 'jest-diff'
import {h, createView, mount, View, Wrapper} from '../src/index'

/**
 * Returns a new div appended to the document body.
 */
function getDiv() {
	const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

/**
 * A class for testing views
 */
class TestMount {
  constructor(cls, props) {
  	this.view = mount(getDiv(), cls, props)
    this.el = this.view.e
  	this.html = undefined
  	this.setHtml()
  }
  setProps(props) {
  	this.view.setProps(props)
    this.setHtml()
  }
  update() {
    this.view.update()
  	this.setHtml()
  }
  setHtml() {
  	this.html = tidy(this.el.outerHTML)
  }
}

/**
 * Convenience function for creating and loading a TestMount.
 */
function load(cls, props) {
  return new TestMount(cls, props)
}

/**
 * Strips extraneous whitespace from HTML
 */
function stripHtml(htmlString) {
  return htmlString.replace(/\n/g, "")
    .replace(/[\t ]+\</g, "<")
    .replace(/\>[\t ]+\</g, "><")
    .replace(/\>[\t ]+$/g, ">")
}

/**
 * Return tidy HTML so it can be meaningfully compared and prettily diffed.
 */
function tidy(html) {
  return prettyPrint(stripHtml(html), {indent_size: 2})
}

/**
 * A matcher for jest tests which checks that a TestMount's html matches
 * what is specified, adjusting for whitespace and indentation.
 *
 * @param {TestMount} testMount An instance of TestMount.
 * @param {string} expectedHtml The expected HTML.
 *
 */
expect.extend({
  toShow(testMount, expectedHtml) {
    const received = tidy(testMount.el.outerHTML)
    const expected = tidy(expectedHtml)
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

module.exports = {
	c,
  createView,
  h,
	load,
	View,
  Wrapper
}
