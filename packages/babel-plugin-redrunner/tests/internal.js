/*
The test suite for the internal functionality.
*/

const lib = require('../lib/utils');
const {extractSaveAsName, extractArgsStr} = lib
const {test} = require('./utils');
let ExitCode = 0;

test('extractSaveAsName works', extractSaveAsName('as:count class="danger"'), 'count')
test('extractSaveAsName works with none', extractSaveAsName('class="danger"'), undefined)

test('extractArgsStr simple', extractArgsStr('args="1, 2"'), "1, 2")
test('extractArgsStr with stuff after', extractArgsStr('args="1, 2, 3" class="danger"'), "1, 2, 3")
test('extractArgsStr with single quotes', extractArgsStr(`as:count args="1, 'a'"`), "1, 'a'")
test('extractArgsStr with double quotes', extractArgsStr(`as:count args='1, "a"'`), '1, "a"')
test('extractArgsStr works with none', extractArgsStr('as:count class="danger"'), undefined)

process.exit(ExitCode)