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
const {getNodeHtmlString, removeProperty} = require('./utils/babel');
const {generateStatements} = require('./redrunner/statement-generators');


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
            if (propName == '__html__') {
              requiresGeneratedStatements = true
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
            let generatedStatements = generateStatements(viewData)

            // Add the generated statements 
            // Note that babel does its own adjustments with spaces, commas etc...
            generatedStatements.forEach(statement => path.insertAfter(babel.template.ast(statement)))
          }
        }
      }
    }
  }
}