import {c, load, View, Wrapper} from '../utils'
import {KeyedCache, SequentialCache} from '../../src/index'

class Container extends View {
  __html__ = '<div :nest="|.props|Child"></div>'
}

class Child extends View {
  __html__ = '<div>{{.props}}</div>'
}

test('Initial load works', () => {
  const div = load(Container, [1, 5, 2, 6])
  expect(div).toShow(`
    <div>
      <div>1</div>
      <div>5</div>
      <div>2</div>
      <div>6</div>
    </div>
  `)
})

test('Adding items works', () => {
  const div = load(Container, [5, 2])
  expect(div).toShow(`
    <div>
      <div>5</div>
      <div>2</div>
    </div>
  `)
  div.update([5, 2, 6])
  expect(div).toShow(`
    <div>
      <div>5</div>
      <div>2</div>
      <div>6</div>
    </div>
  `)
})

test('Removing items works', () => {
  const div = load(Container, [5, 2, 3, 8])
  div.update([2, 8])
  expect(div).toShow(`
    <div>
      <div>2</div>
      <div>8</div>
    </div>
  `)
})


test('Complete replacement', () => {
  const div = load(Container, [5, 2, 3, 8])
  div.update([22, 18])
  expect(div).toShow(`
    <div>
      <div>22</div>
      <div>18</div>
    </div>
  `)
})

test('Clear', () => {
  const div = load(Container, [5, 2, 3, 8])
  div.update([])
  expect(div).toShow(`
    <div>
    </div>
  `)
})


// test('Call to items works', () => {
//   const div = load(Container,
//              [1, 2, 3, 4, 5, 6])
//   div.update([1, 7, 3, 4, 5, 6])
//   expect(div).toShow(`
//     <div>
//       <div>1</div>
//       <div>7</div>
//       <div>3</div>
//       <div>4</div>
//       <div>5</div>
//       <div>6</div>
//     </div>
//   `)

// })