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

1. Decide how to handle removal of nested components
2. Determine if V8 traps will apply to framework
3. Speed test
4. Way to tell a component to clone or not

Tasks:

1. Babel plugin to generate html and watch functions
2. Get babel working with parcel for demos