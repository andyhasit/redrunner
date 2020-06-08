/*
Note: in some cases you HAVE to test using an assignment.
*/
import {c, getNode} from '../utils'
import {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} from '../../lib/redrunner/statement_builders'


test('ArrayStatement', () => {
  const s = new ArrayStatement()
  s.add('"yo"')
  s.add('2')
  expect(s.buildValue()).toMatchCode('["yo", 2]')
})

test('CallStatement', () => {
  const s = new CallStatement('new Wrapper')
  s.add('"yo"')
  s.add('2')
  expect(s.buildValue()).toMatchCode('new Wrapper("yo", 2)')
})

test('FunctionStatement', () => {
  const s = new FunctionStatement('foo, bar')
  s.add('return "yo"')
  expect(s.buildAssign('a')).toMatchCode('a = function(foo, bar) {return "yo"}')
})

test('ObjectStatement', () => {
  const s = new ObjectStatement()
  s.add('foo', '0')
  s.add('bar', '1')
  expect(s.buildAssign('a')).toMatchCode("a = {'foo': 0, 'bar': 1}")
})

test('ValueStatement', () => {
  const s = new ValueStatement()
  s.set('"yo"')
  expect(s.buildAssign('a')).toMatchCode('a = "yo"')
})

test('Function nested in ArrayStatement', () => {
  const s = new ArrayStatement()
  const f = new FunctionStatement('foo, bar')
  f.add('return "yo"')
  s.add('1')
  s.add(f)
  s.add('2')
  expect(s.buildValue()).toMatchCode('[1, function(foo, bar) {return "yo"}, 2]')
})

test('Function nested in ObjectStatement', () => {
  const s = new ObjectStatement()
  const f = new FunctionStatement('foo, bar')
  f.add('return 0')
  s.add('x', f)
  expect(s.buildAssign('a')).toMatchCode("a = {'x': function(foo, bar) {return 0}}")
})