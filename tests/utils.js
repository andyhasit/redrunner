const {View, mount} = require('../src/index')

const c = console
const m = document.createElement('div')
m.id = "main"
document.body.appendChild(m)

/**
 * Returns a new div appended to the document body.
 */
function getDiv() {
	const div = document.createElement('div')
  m.appendChild(div)
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
 * Generate tidy HTML so it can be meaningfully compared and diffed.
 */
function tidy(html) {
  return html
}


module.exports = {
	c,
	mnt,
	View,
	tidy
}
