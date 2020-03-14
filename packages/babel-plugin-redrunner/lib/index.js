/*
A babel plugin for RedRunner.

Note that this requires "@babel/plugin-syntax-class-properties" to be applied
first, which simply allows class properties syntax (else code won't parse).

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
const {buildStatement} = require('./utils');


/* This is a visitor definition that is used for a path.traverse call
 * inside the Class visitor
 */
const RemoveClassPropertyVisitor = {
  ClassProperty(path) {
    path.remove()
  }
};


module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type == 'ClassDeclaration') {
          let className = path.node.id.name;
          for (node of path.node.body.body) {
            let propName = node.key.name
            if (propName == '__html__') {
              // has raw and cooked - what is cooked?
              let htmlString = node.value.quasis[0].value.raw
              path.traverse(RemoveClassPropertyVisitor)
              let statement = buildStatement(className, htmlString)
              // Note that this does its own adjustments with spaces, commas etc...
              path.insertAfter(babel.template.ast(statement))
            }
          }
        }
      }
    }
  }
}