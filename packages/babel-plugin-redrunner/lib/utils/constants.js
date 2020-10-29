const c = console
const EOL = require('os').EOL
const jsdom = require("jsdom");

const redrunnerDefs = ['__html__', '__clone__', '__stubs__']
const { JSDOM } = jsdom;

const parseHTML = function(html) {
  return new JSDOM(`<!DOCTYPE html>` +html).window.document.body.childNodes[0];
}

module.exports = {c, EOL, parseHTML, redrunnerDefs}