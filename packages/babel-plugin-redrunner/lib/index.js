/*
A babel plugin for RedRunner.

Note that this requires "@babel/plugin-syntax-class-properties" to be used too.

Do not confuse with "@babel/plugin-proposal-class-properties" which does the
actual transformation, which you can apply after this plugin.

CODE NOTES

Transforming

class A() {
  __html__ = '<div></div>'
}

Into:

class A() {
  build() {...}
}

Is difficult as babel plain text replacement is difficult, and so with a method as its
not valid JS, so we're adding the newly build function on the prototype instead:


class A() {
  ...
}
A.prototype.build = function () {...}

*/

const babel = require('@babel/core');
const {c} = require('./utils/constants');
const {ENV, getNodeHtmlString, removeProperty} = require('./utils/babel');
const {generateStatements} = require('./redrunner/statement-builder');
const {addDevToolsHelper, addViewInfo} = require('./devtools/helper');

let devToolsHelperAdded = false

module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type == 'ClassDeclaration') {
          let requiresGeneratedStatements = false
          let viewData = {className: path.node.id.name}

          // Iterate over classe's nodes to find ones we care about
          for (node of path.node.body.body) {
            let propName = node.key.name
            if (propName == '__html__' || propName == '__clone__') {
              requiresGeneratedStatements = true
              viewData.cloneNode = propName == '__clone__'
              viewData.htmlString = getNodeHtmlString(node)
              removeProperty(path)
            }
            // TODO: decide if this is required
            // else if (propName == '__watch__') {
            //   requiresGeneratedStatements = true
            //   removeProperty(path)
            // }
          }

          if (requiresGeneratedStatements) {
            const statements = generateStatements(viewData)
            // Note that babel does its own adjustments with spaces, commas etc...
            statements.forEach(statement =>
              path.insertAfter(babel.template.ast(statement))
            )

            if (ENV == 'development') {
              if (!devToolsHelperAdded) {
                // It gets chucked in front of the first class, pretty arbitrary...
                path.insertBefore(babel.template.ast(addDevToolsHelper()))
                devToolsHelperAdded = true
                // c.log(Object.keys(path))
                // c.log(Object.keys(path.hub))
                // c.log(Object.keys(path.hub.file))
                // c.log(Object.keys(path.hub.file.opts))
                // c.log(path.hub.file.opts.cwd)
              }
              let fileName = path.hub.file.opts.filename
              path.insertAfter(babel.template.ast(addViewInfo(viewData, fileName)))
              //throw path.buildCodeFrameError("Error message here");
            }
          }
        }
      }
    }
  }
}