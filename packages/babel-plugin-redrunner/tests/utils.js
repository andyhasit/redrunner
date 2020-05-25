const c = console;
const ColourReset = "\x1b[0m";
const FgGreen = "\x1b[32m";
const FgRed = "\x1b[31m";
const EOL = require('os').EOL;

function green(text) {
  c.log(FgGreen, text)
}

function red(text) {
  c.log(FgRed, text)
}

function reset(text) {
  c.log(ColourReset)
}

module.exports = {c, EOL, green, red, reset}