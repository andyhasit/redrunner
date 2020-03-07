# RedRunner

A simple UI framework.

## 1. Development

There are no unit tests yet, so develop using the demos. Run via speed test too.

### Demos

Run demos individually with parcel:

```bash
cd demos
parcel click_counter/index.html
```

The demos use relative imports to **src** and have no external dependencies.

### Build

Use [microbundle](https://github.com/developit/microbundle) to build to **dist**:

```
npm run build
```

## 2. Current State

Planning to have it look something like this:

```javascript
class Main extends Component {
  __html__ = `
    <div>
      <span>0</span>                       <<< count
      <a class="button">Click me</a>       <<< btn
    </div>
  `
  __watch__ = {
      'clickCount': this.clickCountChanged
  }
  clickCountChanged(n,o) {
      this.dom.count.text(`Clicked ${n} times.`)
  }
}
```

Where `__html__` and `__watch__` get transpiled into methods `html()` and `watch()`. Until I have that working I can do it manually:

```javascript
html() {
  let s = this
  s.root = h('div', s).html(`...`)
  let e = s.root.e
  s.dom = {
      count: s._dig_(e, [0, 0]),
      btn: s._dig_(e, [0, 1])
  }
}
watch() {
   let s = this
   s._watches_ = {
       clickCount: s.clickCountChanged,
   }
   s._values_ = {
       clickCount: 0,
   }  
}
```

Critical tasks:

1. How to track nested components
2. How to declare components in the html string
3. Determine if V8 traps will apply to framework
4. Speed test
5. Way to tell a component to clone or not

Tasks:

1. Babel plugin to generate html and watch functions
2. Complete `_attached_` method
3. Get babel working with parcel for demos

### Current work

I think I have the child component tracking sorted by detecting visibility up to the parent element's node, but need to check its viable. Maybe this means we need one root component?

Think of way to declare child components in html:

```html
<div as='yo'>
<ChildComponent args="('hello', 60)"></ChildComponent>
```





























----------



Track nested components... What do I need?

* Know when they are added
* Know when removed

Add: easy, use a method. Remove is trickier.

How it could happen:

```javascript
btnClick(e) {
  let e = this.dom.tasks
  // Set new list of child elements
  e.inner([...])
  e.clear()
  e.child()
}
```

Options:

* wrappers keep track themselves
* wrapper methods update component

##### Methods update component

Flow:

1. Component `update()` (during which elements may change list of nested)
2. For each nested: `update()`

Decide whether to store as nested dict, array of arrays?

Take the following:

```html
<div>
    <div>
        <span></span>
        <span></span>
    </div>
    <ul>
        <li>
        	<component/>
        </li>
        <li>
        	<component/>
        </li>
    </ul>
</div>
```

The change is achieved by calling `items()` on the **ul**. Easy to manage if the **li** elements are the components, but what it they are nested underneath?

* All child components are created with ref to parent, no matter how nested

Decisions:

- caching will be done on wrappers
- caching is not the same as nested

One big list, all active/inactive?

### Features

| Feature | Done |
| ------- | ---- |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |
|         |      |

