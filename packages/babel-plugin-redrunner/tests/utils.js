const c = console;
const ColourReset = "\x1b[0m";
const FgGreen = "\x1b[32m";
const FgRed = "\x1b[31m";


function green(text) {
  c.log(FgGreen, text)
}

function red(text) {
  c.log(FgRed, text)
}

function reset(text) {
  c.log(ColourReset)
}

function test(name, input, output) {
	if (input == output) {
		green(`PASS: "${name}"`)
	} else {
		red(`FAIL: "${name}"`)
		red('> expected: ' + output)
		red('> got:      ' + input)
		ExitCode = 1;
	}
	reset()
}

module.exports = {green, red, reset, test}