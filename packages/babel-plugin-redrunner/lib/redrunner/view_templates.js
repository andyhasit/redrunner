/**
 * This feature is temporarily disabled.
 */

const fs = require("fs")
const path = require('path')
const {parseHTML, stripHtml} = require('../utils/dom')
const {c} = require('../utils/constants')

/**
 * A cache of view templates by path. These are files, typically called views.html
 * which contain the HTML for views.
 */
class ViewTemplateCache {
  constructor() {
    this._fileCaches = {}
  }
  getHtml(filepath, className) {
    const dir = path.dirname(filepath)
    const templateFile = path.join(dir, 'views.html')
    if (fs.existsSync(templateFile)) {
      let cachedViews = this._fileCaches[templateFile]
      if (cachedViews === undefined) {
        cachedViews = this.addToCache(templateFile)
      }
      return cachedViews[className]
    }
  }
  addToCache(templateFile) {
    const contents = fs.readFileSync(templateFile, {encoding:'utf8', flag:'r'})
    const dom = parseHTML(stripHtml(contents)) // Must strip!
    const fileCache = {}
    const childNodes = Array.from(dom.childNodes)
    childNodes.forEach(n => {
      fileCache[n.tagName] = n.childNodes[0].outerHTML
    })
    this._fileCaches[templateFile] = fileCache
    return fileCache
  }
}

const viewTemplates = new ViewTemplateCache()
module.exports = {viewTemplates}
