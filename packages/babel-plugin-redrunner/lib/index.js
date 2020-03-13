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
const parse = require('@babel/parser');
const EOL = require('os').EOL;
const htmlparse = require('node-html-parser');
const c = console;


/* Generates the source code of the method which will replace the __html__ class property */
function generateHtmlMethod(htmlString) {
  let dom = htmlparse.parse(htmlString)
  let startNode = undefined
  let lines = []

  function processNode(node) {
    let text
    if (node.tagName) {
      if (startNode) {
        text = `  n.child(h('${node.tagName}'))`
      } else {
        text = `  let n = h('${node.tagName}')`
        startNode = 1
      }
      lines.push(text)
    }
    node.childNodes.forEach(processNode)
  }

  processNode(dom)
  return lines.join(EOL)
}

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
            let propName = node.key.name;
            if (propName == '__html__') {
              // has raw and cooked - what is cooked?
              let htmlString = node.value.quasis[0].value.raw;
              path.traverse(RemoveClassPropertyVisitor); // This is how we pass parameters
              let functionBody = generateHtmlMethod(htmlString)
              let statement = [`${className}.prototype.build = function(){`, functionBody, '};'].join(EOL)
              // Note that ast adds spacing between brackets...
              path.insertAfter(babel.template.ast(statement))
            }
          }
        }
      }
    }
  };
};

/*

Old arg parsing stuff...

oldArgs = '__args__'
newArgs = 'app, box, bubble, build, el, h, s, seq, watch'


function replace(entry) {
  if (entry.name === oldArgs) {
    entry.name = newArgs
  }
}


function processItems(items) {
  items.forEach(entry => replace(entry))
}


module.exports = () => {
  return {
    visitor: {
      CallExpression(path) {
        processItems(path.node.arguments)
      },
      Function(path) {
        processItems(path.node.params)
      }
    }
  };
};
*/