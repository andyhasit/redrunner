const c = console
const {prettyPrint} = require("html")
import {View, mount} from '../src/index'


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
  	this.el = getDiv()
  	this.view = mount(this.el, cls, props)
    this.el = this.view.root.e // important :-D
  	this.html = undefined
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
 * Convenience function for creating a TestMount.
 */
function mnt(cls, props) {
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


module.exports = {
	c,
	mnt,
	View,
	tidy
}
