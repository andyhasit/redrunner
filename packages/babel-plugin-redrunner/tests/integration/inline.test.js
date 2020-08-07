const {c, EOL, transform, view} = require('../utils')


test('Simple inline', () => {
  const src = view(`
    <div>
      <span>{{name}}</span>
    </div>
  `)
  expect(transform(src)).toMatchSnapshot()
});

test('Inline leaves atts alone', () => {
  const src = view(`
    <div>
      <span>{{name | .getName?}}</span>
      <span id="hey" class="  my-style {{style}}"></span>
    </div>
  `)
  expect(transform(src)).toMatchSnapshot()
});

test('Inline with different endings', () => {
  const src = view(`
    <div>
      <span>{{name|.getName}}</span>
      <span>{{name|.getName?}}</span>
      <span>{{name|.getName()}}</span>
    </div>
  `)
  expect(transform(src)).toMatchSnapshot()
});
