/*
A test runner for the plugin's overall operation.

Just create files in this directory which start with "test_" and have the following format:

foo() {} // code to be parsed
//---------------------------
foo() {} // expected output

The line starting with //--- is deemed the splitter.
Blank lines and lines starting with // are ignored (but multiline and inline comments aren't)

The runner will warn if the tranformed output is not as expected and show a diff.
Note that this is a simple text comparison, and that babel does some minor corrections
with spacing, commas etc...
*/

const babel = require('@babel/core');
const fs = require('fs');
const redRunnerBabelPlugin = require('../lib/index');
const printDiff = require('print-diff');
const {c, EOL, green, red, reset} = require('./utils');


const transformOptions = {plugins: [
	["@babel/plugin-syntax-class-properties"],  // Enable class properties syntax without touching
	[redRunnerBabelPlugin],
	["@babel/plugin-proposal-class-properties"] // Transforms them
]};



/* Splits a file in two parts on the line starting with "//---"
 * Returns two strings.
 */
function splitFile(filePath) {
	let sourceLines = [], expectedOutputlines = [];
	let contents = fs.readFileSync(filePath, 'utf8');
	let addTo = sourceLines;
	contents.split(EOL).forEach(line => {
		if (line.startsWith('//---')) {
			addTo = expectedOutputlines;
		} else {
			let trimmed = line.trim()
		  if ( trimmed !== '' && !trimmed.startsWith('//')) {
				addTo.push(line)
			}
		}
	});
	return [sourceLines.join(EOL), expectedOutputlines.join(EOL)]
}

function stripBlankLines(contents) {
	return contents.split(EOL).filter(line => line.trim() !== '').join(EOL);
}

/* Tests that the expected output matches.
 * Prints diff to terminal
 */
function testFile(filePath) {
	let [input, expectedOutput] = splitFile(filePath);
	//c.log(input)
	let tranformedCode = stripBlankLines(babel.transform(input, transformOptions).code);
	//c.log(tranformedCode)
	if (tranformedCode === expectedOutput) {
		green('PASS: ' + filePath)
	} else {
		ExitCode = 1;
		red('FAIL: ' + filePath)
		printDiff(tranformedCode, expectedOutput)
	}
	reset()
}

/* Main run test and notify of results */
function testAllFilesInDir() {
	fs.readdirSync(__dirname).forEach(file => {
		if (file.startsWith('test_')) {
			testFile(__dirname + '/' + file);
		}
	});
	
}

let ExitCode = 0
testAllFilesInDir()
process.exit(ExitCode)