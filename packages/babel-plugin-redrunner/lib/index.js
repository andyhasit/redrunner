/*
A babel plugin for RedRunner.

Note that this requires "@babel/plugin-syntax-class-properties" to be applied
first, which simply allows class properties syntax (else code won't parse).

Do not confuse with "@babel/plugin-proposal-class-properties" which does the 
actual transformation, which you can apply after this plugin.

CODE NOTES

We want to visit ClassProperty elements (like __html__ which is used in RedRunner). 
However it doesn't seem to be possible to do so, possibly because it is not a
standard JS thing, possibly because another plugin replaces it before we have 
the chance to.

The solution is to visit the Class and then call path.traverse

*/

const parse = require('node-html-parser');
const c = console;


/* Generates the source code of the method which will replace the __html__ class property */
function generateHtmlMethod(htmlString) {
  return `function build() {
      return a + b;
    }`
}

/* This is a visitor definition that is used for a path.traverse call
 * inside the Class visitor
 */
const HtmlClassPropertyVisitor = {
  ClassProperty(path) {
    let code = generateHtmlMethod(this.htmlString)
    path.replaceWithSourceString(code);
  }
};

module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type == 'ClassDeclaration') {
          for (node of path.node.body.body) {
            let propName = node.key.name;
            if (propName == '__html__') {
              // has raw and cooked - what is cooked?
              let htmlString = node.value.quasis[0].value.raw;
              path.traverse(HtmlClassPropertyVisitor, {htmlString}); // This is how we pass parameters
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