const {c, EOL, transform, component} = require('../utils')


test('Simple inline', () => {
  const src = component(`
    <div>
      <span>{{name}}</span>
    </div>
  `)
  expect(transform(src)).toMatchSnapshot()
});

test('Inline leaves atts alone', () => {
  const src = component(`
    <div>
      <span>{{name | .getName?}}</span>
      <span id="hey" class="  my-style {{style}}"></span>
    </div>
  `)
  expect(transform(src)).toMatchSnapshot()
});

test('Inline with different endings', () => {
  const src = component(`
    <div>
      <span>{{name|.getName}}</span>
      <span>{{name|.getName?}}</span>
      <span>{{name|.getName()}}</span>
    </div>
  `)
  expect(transform(src)).toMatchSnapshot()
});
