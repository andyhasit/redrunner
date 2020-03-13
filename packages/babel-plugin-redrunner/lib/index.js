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

/* 
 * Extracts the name from rawAttrs (e.g. 'as:count class="danger"' > 'count')
 */
function extractName(rawAttrs) {
  if (rawAttrs) {
    let match = rawAttrs.split(' ').find(el => el.startsWith('as:'))
    if (match) {
      return match.substr(3)
    }
  }
}


/*
 * Find locations of text in string
 */
function findLocations(html) {
  var regexp = / as:/g;
  var match, locations = [];
  while ((match = regexp.exec(html)) != null) {
    locations.push(match.index);
  }
  return locations
}


function findCut(html, start) {
  let cut, nextSpace = html.indexOf(' ', start + 1), nextClosingTag = html.indexOf('>', start);
  if (nextSpace == -1) {
    cut = nextClosingTag
  } else if (nextClosingTag == -1) {
    cut = nextSpace
  } else {
    cut = (nextSpace > nextClosingTag)? nextClosingTag : nextSpace;
  }
  return cut
}

/*
 * Strips redrunner specific data from html, because fuck regex.
 */
function cleanHtml(html) {
  let remove = [], locations = findLocations(html)
  locations.forEach(loc => {
    let cut = findCut(html, loc)
    remove.push(html.substring(loc, cut))
  })
  remove.forEach(w => html = html.replace(w, ''))
  return html
}

/* Generates the source code of the build method */
function generateBuildFunctionBody(htmlString) {
  let strippedHtml = htmlString.replace(/\n/g, "")
    .replace(/[\t ]+\</g, "<")
    .replace(/\>[\t ]+\</g, "><")
    .replace(/\>[\t ]+$/g, ">")

  let namedElements = []
  let stack = []
  function processNode(node, i) {
    stack.push(i)
    let name = extractName(node.rawAttrs)
    if (name) {
      // the last comma is magically removed by babel (...)
      namedElements.push(`${name}: m.__lookup([${stack.slice(2)}]),`) 
    } 
    node.childNodes.forEach(processNode)
    stack.pop()
  }
  let dom = htmlparse.parse(strippedHtml)
  processNode(dom)

  // Build function body line by line
  let lines = ['m.root = wrap(`' + cleanHtml(strippedHtml) + '`);']
  if (namedElements.length > 0) {
    lines.push('m.dom = {')
    namedElements.forEach(n => lines.push(n))
    lines.push('};')
  } else {
    lines.push('m.dom = {};')
  }
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
              let functionBody = generateBuildFunctionBody(htmlString)
              let statement = [`${className}.prototype.__build = function(m, wrap){`, functionBody, '};'].join(EOL)
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