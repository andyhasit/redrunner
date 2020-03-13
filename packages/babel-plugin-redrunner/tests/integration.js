/*
A test runner for the plugin's overall operation.

Just create files in this directory which start with "test_" and have the following format:

	foo() {} // code to be parsed
	//---------------------------
	foo() {} // expected output

The runner will warn if the tranformed output is not as expected and show a diff.
Note that this is a simple text comparison, and that babel does some minor corrections
with spacing, commas etc...
*/

const babel = require('@babel/core');
const fs = require('fs');
const redRunnerBabelPlugin = require('../lib/index');
const EOL = require('os').EOL;
const printDiff = require('print-diff');

const c = console;
const ColourReset = "\x1b[0m";
const FgGreen = "\x1b[32m";
const FgRed = "\x1b[31m";

const transformOptions = {plugins: [
	["@babel/plugin-syntax-class-properties"],  // Enable class properties syntax without touching
	[redRunnerBabelPlugin],
	["@babel/plugin-proposal-class-properties"] // Transforms them
]};


/* Prints in colour */
function print(colour, text) {
	c.log(colour, text)
	c.log(ColourReset)
}

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
		print(FgGreen, 'PASS: ' + filePath)
	} else {
		ExitCode = 1;
		print(FgRed, 'FAIL: ' + filePath)
		printDiff(tranformedCode, expectedOutput)
	}
}

/* Main run test and notify of results */
function testAllFilesInDir() {
	fs.readdirSync(__dirname).forEach(file => {
		if (file.startsWith('test_')) {
			testFile(__dirname + '/' + file);
		}
	});
	
}

let ExitCode = 0;
testAllFilesInDir();
process.exit(ExitCode);