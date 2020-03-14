/*
The test suite for the internal functionality.
*/

const lib = require('../lib/utils');
const {
	extractAttributeValue,
	extractWholeAttribute,
	findNextClosingTagOrWhiteSpace,
	unquotedAttEnd
} = lib
const {red, green, reset} = require('./utils');

let ExitCode = 0;

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


test('findNextClosingTagOrWhiteSpace at 0', findNextClosingTagOrWhiteSpace('as=count hahah', 0), 8)
test('findNextClosingTagOrWhiteSpace at 0 (implicit)', findNextClosingTagOrWhiteSpace('as=count hahah'), 8)
test('findNextClosingTagOrWhiteSpace with start', findNextClosingTagOrWhiteSpace('   as=count hahah', 4), 11)
test('findNextClosingTagOrWhiteSpace with tag', findNextClosingTagOrWhiteSpace('   as=count> ', 4), 11)
test('findNextClosingTagOrWhiteSpace with tag 2', findNextClosingTagOrWhiteSpace('as=co> '), 5)


test('extractAttributeValue returns undefined if not found', extractAttributeValue('class="danger"', 'as'), undefined)
test('extractAttributeValue without quotes', extractAttributeValue('as=count class="danger"', 'as'), 'count')
test('extractAttributeValue without quotes at end', extractAttributeValue(' class="danger" as=count', 'as'), 'count')
test('extractAttributeValue with quotes', 
	extractAttributeValue('as="1, 2" class="danger"', 'as'), "1, 2")
test('extractAttributeValue with single quotes inside', 
	extractAttributeValue(`as="1, 'a'"`, 'as'), "1, 'a'")
test('extractAttributeValue with double quotes inside', 
	extractAttributeValue(`as='1, "a"'`, 'as'), '1, "a"')

test('extractWholeAttribute returns undefined if not found', extractWholeAttribute('class="danger"', 'as'), undefined)
test('extractWholeAttribute without quotes', extractWholeAttribute('as=count class="danger"', 'as'), 'as=count')
test('extractWholeAttribute without quotes at end', extractWholeAttribute(' class="danger" as=count', 'as'), 'as=count')
test('extractWholeAttribute with quotes', 
    extractWholeAttribute('as="1, 2" class="danger"', 'as'), 'as="1, 2"')
test('extractWholeAttribute with single quotes inside', 
    extractWholeAttribute(`as="1, 'a'"`, 'as'), `as="1, 'a'"`)
test('extractWholeAttribute with double quotes inside', 
    extractWholeAttribute(`as='1, "a"' `, 'as'), `as='1, "a"'`)

process.exit(ExitCode)