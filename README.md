# RedRunner

A small JavaScript framework with legs.

## 1. Overview

RedRunner is a JavaScript framework for building dynamic pages and apps.

It is in early development and not ready to use. The current version is being trialed on a large project to see how it fares. Things are changing rapidly, and a lot of the information below may be out of date.

## 2. Demo

There is a very minimal demo app, which you can run like so:

```
cd demo
npm i
npm run start
```

You can also run these to inspect the output and bundle sizes:

```
npm run build-dev
npm run build-prod
```

## 3. Installation

#### Quick start

For new projects use the [demo](https://github.com/andyhasit/redrunner/tree/master/demo) as a starting point. For existing projects you can copy the relevant parts from **package.json** and **webpack.config.js** into your project.

Alternatively, you can install RedRunner manually with npm and follow the rest of the instructions here.

```
npm i -D redrunner
```

This will install **redrunner** and a compatible version of **babel-plugin-redrunner**.

#### Babel configuration

You must include the following plugins ***in this order*** in your babel configuration:

```json
"plugins": [
  ["babel-plugin-redrunner"],
  ["@babel/plugin-proposal-class-properties"]
]
```

The `babel-plugin-redrunner` transforms parts of your code and is required for RedRunner to work.

#### Bundling

I recommend using [webpack](https://webpack.js.org/) instead of alternatives as it gives you better control over source maps, which really helps for development.

#### Source maps

The babel plugin replaces each view's `__html__` field with generated code, and debugging is a lot easier if you can see that generated code.

With webpack you can set the config's `devtools` to something like `'eval-cheap-source-map'` which makes the source maps show the *transformed* code, but preserves the module separation which is nice. However this will include *all* transformations, so if you're transpiling to ES5 (which you probably do using a preset) then it will make it harder to track your own code.

One solution is not transpile to ES5 during development, meaning the only transformations you'll see are RedRunner's, which makes debugging a lot nicer.

The [demo's webpack.config.js](https://github.com/andyhasit/redrunner/tree/demo/webpack.config.js) file shows one way to achieve this. 

You can read more about webpack's devtools option [here](https://webpack.js.org/configuration/devtool/).


## 4. User Guide

A more complete tutorial is on its way. Until then you can:

* Study the [demo](#Demo)
* Study the unit tests [here](https://github.com/andyhasit/redrunner/tree/packages/redrunner/tests)
* Read the overview given in this section...

### 4.1 Basics

RedRunner is used in a similar way to React and Vue: you create your app from components (called Views) which each control their own section of the DOM. Aside from a basic HTML skeleton with anchor points on which to mount views, everything else is done in pure JavaScript modules.

Here is what the `<body>` tag of the demo's only html file looks like: 

```html
<body>
  <div id="menu"></div>
  <div id="main"></div>
  <script type="text/javascript" src="main.js"></script>
</body>
```

### 4.2 Views

A view is an object which controls a section of the DOM. Views can contain nested views, forming a tree which will mirror the broad structure of the page. 

Views are the only building blocks which RedRunner supplies - there are no controllers, widgets, services or other gimmicks (but views have internal parts which you can work with).

You define a view by extending the `View` class:

```javascript
import {View} from 'redrunner'

class MyView extends View {
  __html__ = `
    <div>
      <h1>Hello {{name}}</h1>
    </div>
  `
}
```

The main focus is the `__html__` field, but you will also write methods, either to hook into life-cycle events or for custom functionality.

### 4.3 The \_\_html\_\_ field

The `__html__` field gets converted into code by RedRunner's babel-plugin (`babel-plugin-redrunner`). The generated code is added to the prototype of your view class, and interacts with methods defined in the base `View` class to build the DOM and update it when things change etc...

The plugin also removes the `__html__` field from the class (except in development mode as it helps with debugging). Given that `__html__` won't exist at run time `${template_literals}` are no use.

### 4.4 Mounting

A view instance can be mounted to the DOM using the `mount` function, which accepts a DOM node (or a jQuery like id string), a view class, and optionally data to pass as props.

```javascript
import {mount} from 'redrunner'
import {MyView} from './my-views'

mount('#main', MyView, {})
```

> `mount()` is only used to mount the small number of top level views. Nested views are automatically mounted by the parent view so you won't use this function much.

The 3 code snippets above combine to produce this:

```html
<body>
  <div id="menu"></div>
  <div id="main">
  	<h1>Hello RedRunner</h1>
  </div>
  <script type="text/javascript" src="main.js"></script>
</body>
```

Not very impressive, so lets add some dynamic content.

### 4.5 Inline directives

RedRunner has several ways of making content dynamic the simplest of which is an inline directive. Inline directives uses curly braces and are placed in the `__html__` field:

```javascript
class UserProfile extends View {
  __html__ = `
    <ul>
     <li>{{firstName}}</li>
     <li>{{lastName}}</li>
    </ul>
  `
}
```

##### Props

Used this way, `firstName` and `lastName` refer to fields on the view's *props*. Props are how we pass data into a view, which for a top level view we do like this:

```javascript
const props = {firstName: 'Jane', lastName: 'Doe'}
const view = mount('#main', UserProfile, props)
```

> Most views in your app will be nested views, and you pass props differently. We're just using a top level component as its easier to illustrate.

##### Prefixes

You can prefix a field with `.` which tells RedRunner to look for it on the view instance rather than the props:

```javascript
class UserProfile extends View {
  __html__ = `
    <ul>
     <li>{{.fullName}}</li>
    </ul>
  `
  init() {
    this.fullName = `${this.props.firstName} ${this.props.lastName}`
  }
}
```

> The `init()` method gets called after the view is built and has been given its props, here we are just using it to set the field `fullName` on the view instance.
>
> Note that setting a field during `init()` is generally bad practice as it introduces state, which we'll cover later.

You can also prefix a field with `..` which tells RedRunner to look for it in the global (module) scope:


```javascript
const today = new Date()

class DateView extends View {
  __html__ = `<div>{{..today}}</div>`
}
```

##### Suffixes

You can suffix a field with `()` or `?` to indicate that the field should be called as a function:

```javascript
class UserProfile extends View {
  __html__ = `
    <ul>
     <li>{{.fullName?}}</li>
    </ul>
  `
  fullName() {
    return `${this.props.firstName} ${this.props.lastName}`
  }
}
```

> This implementation will update its DOM when the props change, whereas the previous one which set `fullName` in the `init()` method won't - because `init()` only gets called once on each view instance.
>
> It is important to remember that you will likely reuse the same view instances, and therefore should not be saving data as state.

And of course you can place inline directives in attributes too:

```html
<div class="{{.getCssClass?}}">Hello {{.fullName?}}</div>
```

### 4.6 Updates

To update a view after props have changed, you must call its `update()` method:

```javascript
const props = {firstName: 'Jane', lastName: 'Doe'}
const view = mount('#main', UserProfile, props)
props.firstName = 'John'
// Nothing happens until you call:
view.update()
```

If you come from an [Angular](https://angular.io/) background this might feel rather manual (but then you probably also know how quickly magic data binding turns sour!) RedRunner has no data binding, watched arrays or other hidden magic: you are in control of what updates and when.

Having said that, in most apps you simply update the top level component after every data change, and as `update()` cascades down to nested views it all feels very automatic.

If you come from a [React](https://reactjs.org/) background this will feel familiar, except that you can call `update()` without arguments. RedRunner views store a reference to their props, which they retain until you pass new props. 

RedRunner doesn't enforce statelessness as stringently as React. In most cases you should make your views stateless and not think any further on it, but RedRunner is designed to facilitate serious performance optimisations, the likes of which can only achieved by tracking state (mostly view caches) and then you do need to keep track of things.

One thing to note is that RedRunner won't touch the DOM if the values are the same:

```javascript
const props = {firstName: 'Jane', lastName: 'Doe'}
const view = mount('#main', UserProfile, props)
const newProps = {firstName: 'Jane', lastName: 'Doe'}
view.update(newProps)
// DOM stays untouched as the values are the same, even if the props object is different.
```

### 4.7 Transformers

Inline directives can take a second argument to transform the data before it hits the DOM:

```javascript
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1)

class UserProfile extends View {
  __html__ = `
    <ul>
     <li>{{firstName|..capitalise?}}</li>
     <li>{{lastName|..capitalise?}}</li>
    </ul>
  `
}
```

The same rule for **prefixes** and **suffixes** apply, which is why we need the `?` to ensure `capitalise` is read as a function and not a field. Why you might want do use a field will become apparent later, for now just remember the same syntax applies to both arguments.

A transformer function actually gets called with new *and* old value, which means you can do things like this:

```javascript
class FriendsTracker extends View {
  __html__ = `<div>{{friends.length|.showFriendCount?}}</div>`
  showFriendCount(n, o) {
    return `${n} friends (previously: ${o})`
  }
}
```

> Notice how we can access nested properties like `friends.length`
>

As with a single argument directive, nothing happens if the value hasn't changed. In fact `showFriendCount()` doesn't even get called if `friends.length` hasn't changed. This functionality is achieved by using *watchers*.

### 4.8 Watchers

A view creates a *watcher* for each distinct value used in the directives. 

A watcher is a simple object with a target (the field or function with the value) and an array of callbacks. When you call `update()` on a view it goes through the watchers and gets the target's new value. If that new differs from the old value, the callbacks are called.

Lets see how this works:

```javascript
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1)

class UserProfile extends View {
  __html__ = `
    <ul>
     <li>{{.fullName?}}</li>
     <li>{{.fullName?|..capitalise?}}</li>
    </ul>
  `
  fullName() {
    return `${this.props.firstName} ${this.props.lastName}`
  }
}
```

The above view will only create *one* watcher which targets `.fullName?` and has two callbacks, one for each `<li>` element. During `update()` it will call `view.fullName()` *once* and if that has changed it then calls the callbacks.

The first callback uses the value of `fullName` directly, the second runs it through the `capitalise()`. Note that the transformer won't get called if the value hasn't changed.

This is another point of difference compared to React:

- React performs all the data manipulations, and then patches the parts of the DOM which have changed. 
- RedRunner checks to see if the relevant data has changes data before doing manipulations, which makes it a lot more efficient, and that's before we even get into heavy performance optimisation.

### 4.9 Transformers II

A transformer function doesn't have to make use of the *new* and *old* arguments provided - it can return any value based on whatever it like. Let's modify our FriendTracker:

```javascript
class FriendsTracker extends View {
  __html__ = `
    <div>
      <div>{{friends.length|.showFriendCount?}}</div>
      <div>{{friends.length|.showFriendNames?}}</div>
    </div>
  `
  showFriendCount() {
    return `Your have ${this.props.friends.length} friends.`
  }
  showFriendNames() {
    const names = this.props.friends.map(f => f.name).join()
    return `Your friends are: ${names}`
  }
}
```

In this arrangement `friends.length` merely acts as a test to determine whether to call `showFriendNames()` and update the DOM.

Just to recap, inline directives can be used in the following ways:

```html
<div>{{valueToWatchAndDisplay}}</div>
<div>{{valueToWatch|tranformationValueForDisplay}}</div>
<div>{{valueToWatch|valueToDisplay}}</div>
```

### 4.10 Always update

There's a flaw in our latest FriendsTracker: if we lose one friend but gain a new one, then when we update the view `friends.length` will be the same as before, meaning `showFriendNames()` wouldn't get called and the names would not be updated.

So we need a better way to determine if the list of friends has changed. We would normally be using nested views to display repeat elements, so we'll cover this later. In the meantime we'll just tell a directive to always update using the `*` symbol:

```html
<div>{{*|.showFriendNames?}}</div>   <!-- Rebuilds on every update -->
```

This is extremely useful during prototyping.

### 4.11 Never update

We can also leave the first argument empty, which means build only once:

```html
so <div>{{*|.showFriendNames?}}</div>   <!-- Builds once and never changes -->
```

This is useful for static components built with variables, e.g. buttons.

### 4.12 Inline gotchas

There are two gotcha with inline directives inside of tags

##### You can only have one

You can't use more than one inline in the text area of a single element:

```html
<!-- This will fail -->
<div>Hello {{firstName}} {{lastName}}</div>  
```

You could use spans, but this is ugly:

```html
<!-- This is ugly -->
<div>
    Hello <span>{{firstName}}</span> <span>{{firstName}}</span>
</div>
```

The better solution is to have the full text generated by a function which builds the full text.

```html
<!-- This is best -->
<div>{{.greeting?}}</div>
```

##### Must be a leaf node

Inline directives will overwrite the textContents of the element it resides in, in this case, this div:

```html
<!-- This will delete the <strong> element -->
<div>
    <strong>Hello</strong> {{firstName}}
</div>
```

Note that these only apply to inline directives which set the inner contents of an element. Inline directives for attributes are not affected.

```html
<!-- This is perfectly fine -->
<div id="{{myId}}" class="{{outterCss}}">
    <span class="{{innerCss}}">Hello {{firstName}}</span>
</div>
```

And that covers everything you need to know about inline directives.

### 4.13 Standard directives

Standard directives are instructions to the plugin's code generating mechanism. 

##### Just HTML attributes

We write standard directives as HTML attributes in the view's `__html__` field (they will be stripped out by the plugin so you won't see them on the page). The built in directives all start with `:` but you can change this (and even define your own).

##### Example

This code:

```javascript
class Basket extends View {
  __html__ = `
    <div>
      <div>£{{basketTotal}}</div>
      <button :on="click|.update?">Refresh</button>
      <ul :items="*|basketContents|BasketItem"></ul>
    </div>
  `
}

class BasketItem extends View {
  __html__ = `
    <li>
      <span>{{name}}</span>
      <span>{{price}}</span>
    </li>
  `
}
```

Would yield something like this:

```html
<div>
  <div>£2.15</div>
  <button>Refresh</button>
  <ul>
    <li>
      <span>Bread</span>
      <span>£1.15</span>
    </li>
    <li>
      <span>Bananas</span>
      <span>£1.00</span>
    </li>
  </ul>
</div>
```

##### The :watch directive

The most important directive to understand is **:watch** which you would use like so:

```html
<div :watch="friends.length|.showFriendCount?|text"></div>
```

This does the exact same thing as this inline directive we used earlier:

```html
<div>{{friends.length|.showFriendCount?}}</div>
```

In fact the babel plugin will generate the *exact* same code for both of the above, so you could say inline directives are just a shorthand way of creating **:watch** directives. 

Just like inline directives, you can use `*` and `(blank)` in the arguments in **:watch**:

```html
<div :watch="*|.showFriendCount?|text"></div>  <!-- always update -->
<div :watch="|.showFriendCount?|text"></div>   <!-- only run once -->
<div :watch="friends.length||text"></div>    <!-- use friends.length unmodified -->
```

Many other directives follow the same rules.

This is clearly not as pretty as inline directives, so why use **:watch**?

The answer to that lies in the third argument (so far we have only used `text`) which corresponds to a method on a *wrapper*.

### 4.14 Wrappers

A wrapper is a small object which wraps a single DOM element and exposes methods to manipulate it, very much like jQuery's wrappers:

```javascript
const el = document.getElementById('main');
const wrapper = new Wrapper(el);

wrapper.text('Hello');                // Set the element's text
wrapper.css('button button-danger');  // Add a css class
wrapper.visible(false);               // Hide the element
```

> Don't worry, the wrappers may be similar but RedRunner is nothing like jQuery! 

Views creates a wrapper around every DOM element that needs to be worked with, so a view with the following `__html__` field would create two wrappers:

```html
<div>
  <span>User Details</span>    <!--  no wrapper we we'll never change this -->
  <span>{{firstName}}</span>   <!--  creates a wrapper -->
  <span>{{lastName}}</span>    <!--  creates a wrapper -->
</ul>
```

Most of the time you don't even know they are there - they simply act as RedRunner's internal way to update the DOM (all DOM updates are done through wrappers).

The **:watch** directive lets you pipe a value to any of the wrapper's methods:

```html
<span :watch="shouldItemDisplay?||visible"></span>
<option :watch="isItemSelected||checked"></option>
<option :watch="isItemSelected|.getCss|css"></option>
<div :watch="postHTML||html"></img>
<img :watch="imgUrl||src"></img>
```

>  The above can be achieved more cleanly with inline directives, this is just for illustration.

You can also access the wrappers to work with them directly if you need to. In fact, this is RedRunner's get out of jail card.

### 4.15 Get out of jail card

Every framework has edge cases which it doesn't handle well, be it performance issues or forcing us to write clunky code, and finding a satisfactory resolution to these can consume disproportionate amounts of project time.

One reason we put with that is to avoid having to fall back to low-level DOM manipulation, because:

* It's ugly (unless you bring in a library, but that's bloat)
* It goes against the point of having a framework
* It undermines the integrity of the codebase
* You need to be careful it doesn't break the framework's operation or vice versa.

With RedRunner you don't have this problem. Just to recap:

1. RedRunner only has Views.
2. Views only have wrappers and watches.
3. Views only call their wrapper's methods during `update()` 
4. They only do that if watched values differ from last run.

This means:

1. It's easy to follow what's happening.
2. It's easy to step in and take over, as much or as little as you want.
3. You'd be using the framework's own wrappers to do it.
4. There is very little risk of breaking things.
5. You and you get a nice syntax to work with.

In other words, the kind of manual override that feels totally wrong in any other framework is really quite clean in RedRunner. So clean in fact that it can be considered normal framework code, which makes RedRunner a sort of hybrid between a framework and a library.

There are a few ways you can do this.

##### Use the :watch directive

The first is by only providing two arguments to 

The **:watch** directive usually requires three arguments. If you only specify two, then the second argument (the transformer) gets passed a reference to the wrapper and is expected to update it, rather than expecting a value back to be passed to a wrapper's method.

This is useful if you want to do multiple changes to the element which would look ugly as inline directives

```javascript
class UserInfo extends View {
  __html__ = `
    <div>
      <div>{{name}}</div>
      <div :watch="stats|.renderStatsElement?"></div>
    </div>
  `
  renderStatsElement(n, o, w) {
    // args: newValue, oldValue, wrapper
    const color n > 10 ? 'green' : 'red'
    w.text(`score: ${n}`).style('color', color).visible(true)
  }
}
```
##### Use the :as directive with update()

The **:as** directive lets you name a wrapper, this is then accessible on `this.dom`. You can also override the `update()` method, and use `this.old()` to retrieve an old value.


```javascript
class UserInfo extends View {
  __html__ = `
    <div>
      <div>{{name}}</div>
      <div :as="statsDiv"></div>
    </div>
  `
  update(props) {
    if (this.old('stats') !== props.stats) {
       this.dom.statsDiv.text('Stats changed!')
    }
    /*
    Do whatever you want with the named wrappers.
    Make sure you call super.update() before or after as appropriate, 
    so that the other watches run.
    */
    super.update(props)
  }
}
```

Having this level of control means:

* Far less time spent being stuck or trapped
* Far easier to bust your way through performance issues 

### 4.16 List of directives



#### :as

This directive saves the wrapper on `this.dom` as the name specified, so it can be accessed elsewhere, typically in the `update()` method:

```javascript
class MyView extends View {
  __html__ = `
    <div>
      <div :as="divA"></div>
      <div :as="divB" :watch="name||text"></div>
      <div :as="divC">{{name}}</div>
    </div>
  `
  update(props) {
    this.dom.divA
    this.dom.divB
    this.dom.divC
  }
}
```

#### :on

This directive adds an event listener

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Click Me</button>`
  clicked(e, w) {
    // e is the event, w is the wrapper
  }
}
```

#### :hide

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Go</button>`
  clicked(e, w) {
  }
}
```

#### :inner

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Go</button>`
  clicked(e, w) {
  }
}
```

#### :items

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Go</button>`
  clicked(e, w) {
  }
}
```

#### :show

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Go</button>`
  clicked(e, w) {
  }
}
```

#### :watch

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Go</button>`
  clicked(e, w) {
  }
}
```

#### :wrapper

```javascript
class MyView extends View {
  __html__ = `<button :onclick=".clicked">Go</button>`
  clicked(e, w) {
  }
}
```

### 4.17 Nested views



### 4.18 View caching



### Performance tweaking

### Inheritance & Composition

You can use `__clone__` instead of `__html__` to make the view class create a DOM template first, which works better if you have large number of instances.

##### View methods

The view class has several methods, here are some common ones:



todo: make into table, and move later on.

```javascript
import {View} from 'redrunner'

class MyView extends View {
  __html__ = `<div><h1>Hello</h1></div>`
  // Runs once for each instance, right after the DOM is built
  init() {}
  // Runs on every mount, including the first.
  mount() {}
  // Runs on every unmount.
  unmount() {}
  // Gets called every time the view updates, if overriding be sure to call super!
  update() {super.update()}
}
```







## 5. Contributing

Contributions welcome.

#### Running Tests

Run with:

```
lerna run test
```

Alternatively you can cd into each package and run just the tests for the package:

```
cd packages/redrunner
npm test
```

#### Use the demo

Use the demo as validation in addition to unit tests. 

The demo was deliberately not made into a lerna package because bundlers often treat symlinked modules differently, which could result in a configuration working fine here, but not in a real world project.

There are npm scripts for copying changes to packages made during development (see **demo/package.json**) which avoid the use of symlinks.

#### Tooling

This repo uses [lerna](https://lerna.js.org/). Useful commands:

```
lerna bootstrap
lerna publish
```

## 6. License

MIT