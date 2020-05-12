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
const {getNodeHtmlString, removeProperty} = require('./babel-helpers');
const {generateStatements} = require('./statement-generators');


module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type == 'ClassDeclaration') {
          let requiresGeneratedStatements = false
          // Build object containing component data
          let componentData = {
            className: path.node.id.name
          }

          // Iterate over classe's nodes to find ones we care about
          for (node of path.node.body.body) {
            let propName = node.key.name
            if (propName == '__html__') {
              requiresGeneratedStatements = true
              componentData.htmlString = getNodeHtmlString(node)
              removeProperty(path)
            } else if (propName == '__watch__') {
              requiresGeneratedStatements = true
              // TODO: handle this
              removeProperty(path)
            }
          }

          if (requiresGeneratedStatements) {
            // Build statements using collected data
            let generatedStatements = generateStatements(componentData)

            // Add the generated statements 
            // Note that babel does its own adjustments with spaces, commas etc...
            generatedStatements.forEach(statement => path.insertAfter(babel.template.ast(statement)))
          }
        }
      }
    }
  }
}