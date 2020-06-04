import {c, getNode} from '../utils'
import {
  ArrayStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} from '../../lib/redrunner/StatementBuilders'


test('ArrayStatement', () => {
  const s = new ArrayStatement()
  s.add('"yo"')
  s.add('2')
  expect(s.buildValue()).toMatchCode('["yo", 2]')
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

test('Nested statements', () => {
  const s = new ArrayStatement()
  const f = new FunctionStatement('foo, bar')
  f.add('return "yo"')
  s.add('1')
  s.add(f)
  s.add('2')
  expect(s.buildValue()).toMatchCode('[1, function(foo, bar) {return "yo"}, 2]')
})