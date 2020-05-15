/*
The test suite for the internal functionality.
*/

const {
	getAttVal,
	getAttDefinition,
	findNextClosingTagOrWhiteSpace
} = require('../lib/utils');
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


test('getAttVal returns undefined if not found', getAttVal('class="danger"', 'as'), undefined)
test('getAttVal without quotes', getAttVal('as=count class="danger"', 'as'), 'count')
test('getAttVal without quotes at end', getAttVal(' class="danger" as=count', 'as'), 'count')
test('getAttVal with quotes', 
	getAttVal('as="1, 2" class="danger"', 'as'), "1, 2")
test('getAttVal with single quotes inside', 
	getAttVal(`as="1, 'a'"`, 'as'), "1, 'a'")
test('getAttVal with double quotes inside', 
	getAttVal(`as='1, "a"'`, 'as'), '1, "a"')

test('getAttDefinition returns undefined if not found', getAttDefinition('class="danger"', 'as'), undefined)
test('getAttDefinition without quotes', getAttDefinition('as=count class="danger"', 'as'), 'as=count')
test('getAttDefinition without quotes at end', getAttDefinition(' class="danger" as=count', 'as'), 'as=count')
test('getAttDefinition with quotes', 
    getAttDefinition('as="1, 2" class="danger"', 'as'), 'as="1, 2"')
test('getAttDefinition with single quotes inside', 
    getAttDefinition(`as="1, 'a'"`, 'as'), `as="1, 'a'"`)
test('getAttDefinition with double quotes inside', 
    getAttDefinition(`as='1, "a"' `, 'as'), `as='1, "a"'`)

process.exit(ExitCode)