# RedRunner

A tiny progressive frontend framework.

#### Update May 2020

RedRunner works (experimentally) and looks very promising, but is in alpha mode, so anything could change.

To see how it works, look at the **tests** and **demos** (user guide coming soon).

#### Performance

I've been testing performance using [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) and it measures up pretty well. 

It is faster than React in all but one test, the bundles are *much*\* smaller, and the code looks nicer too. 

I'm yet to raise a PR on there to add RedRunner, just been testing it locally to date.

\* The same benchmark app is 4.8K compared to 39K (both gzipped).

## Installation

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

I recommend using [webpack](https://webpack.js.org/) as it gives you full control over source maps which are necessary for development, whereas I found [parcel](https://parceljs.org/) more problematic in this regard.

#### Source maps

The babel plugin replaces each view's `__html__` field with generated code, and debugging is a lot easier if you can see that generated code.

With webpack you can set the config's `devtools` to something like `'eval-cheap-source-map'` which makes the source maps show the *transformed* code, but preserves the module separation which is nice. You can find more details and options [here](https://webpack.js.org/configuration/devtool/).

However this will include *all* transformations, so assuming you have a babel preset then you will see the resulting ES5 output of your code, which isn't pretty.

One solution is not use the preset for development, meaning the only transformations are RedRunner's, which makes debugging a lot nicer. 

The [demo's webpack.config.js](https://github.com/andyhasit/redrunner/tree/demo/webpack.config.js) file shows one way to achieve this.

## User Guide

A more complete tutorial is on its way. Until then you can:

* Study the [demo](#Demo)
* Study the unit tests [here](https://github.com/andyhasit/redrunner/tree/packages/redrunner/tests)
* Read the overview given in this section...

### Basics

RedRunner is used in a similar way to React and VueJs - you create your app from components (called Views) which each control their own section of the DOM. Aside from a basic HTML skeleton with anchor points on which to mount views, everything else is done in pure JavaScript modules.

Here is what the `<body>` tag of the demo's only .html file looks like: 

```html
<body>
  <div id="menu"></div>
  <div id="main"></div>
  <script type="text/javascript" src="main.js"></script>
</body>
```

### Views

A view is an object which controls a section of the DOM. Views can contain nested views, forming a tree which will mirror the broad structure of the page.

You define a view by extending the `View` class:

```javascript
import {View} from 'redrunner'

class MyView extends View {
  __html__ = `
    <div>
      <h1>Hello RedRunner</h1>
    </div>
  `
}
```

> The `__html__` field gets converted into special code by the plugin, which includes code to build the DOM when an instance is requested.
>

Run your file through babel with the above mentioned plugins to see the generated code (it will be hard to follow initially as it interacts with code hidden in the framework, but at least you can see what gets added).

Views are the only building blocks which RedRunner supplies - there are no controllers, widgets, services or other gimmicks (but views have internal parts which you can take control of if needed).

Views also have several methods and hooks which we'll explore later.

### Mounting

A view instance can be mounted to the DOM using the `mount` function, which accepts an DOM node (or a jQuery like id string), a view class, and optionally data to pass as props.

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

### Inline directives

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

This implementation will update its DOM when the props change, whereas the previous one which set `fullName` in the `init()` method won't, because `init()` only gets called one.

### Updates

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

If you come from a [React](https://reactjs.org/) background this will feel familiar, except that you can call `update()` without arguments. RedRunner views store a reference to their props, which they retain until you pass new props, and this is something you need to be aware of.

### Transformers

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

The same rule for **prefixes** and **suffixes** apply. The function actually gets called with old and new value, which means you can do things like this:

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






setTimeout(() => view.update(), 3000);

(don't worry, it cascades down to nested views so )





This implementation of `UserProfile` has the advantage over the previous one which set `fullName` in the `init()` method, as `init()` only gets called once so `fullName` would never change even if the props changed.



only gets called once, soon't be updated if the props change. Lets fix this by making it a function instead:



The suffix `?` in the directive `{{.fullName?}}` tells RedRunner to call this as a function. Let update the props to see this working. Add this after the call to `mount()`:

```javascript
props.firstName = 'John'
setTimeout(() => view.update(), 3000);
```

Notice how nothing changes until `view.update()` gets called. 

RedRunner has no magic data binding or special watched arrays: everything is mechanical and predictable which means less goes wrong. Don't worry, you typically only call `update()` on top level view after data changes, which cascades the call down to nested views, so it feels very automatic.







This is very simple to use (use a value and optionally pass it through a transformer function) but before we explore this further, we're going to cover three concepts:

* Wrappers
* Directives
* Watches

RedRunner's learning curve is steep, but very short. Once you grasp these three concepts you'll have 90% of it covered.

#### Wrappers

A wrapper is an object which wraps a single DOM element and exposes methods to manipulate it, very much like jQuery:

```javascript
const el = document.getElementById('main');
const wrapper = new Wrapper(el);

wrapper.text('Hello');     // Set the element's text
wrapper.cssAdd('danger');  // Add a css class
wrapper.visible(false);    // Hide it
```

But unlike jQuery:

1. You rarely work with them directly (RedRunner mainly uses them internally).
2. They have almost no query functionality (RedRunner almost never queries the DOM).

Each view creates a wrapper for every dynamic element in its DOM. 

The `UserProfile` view described above would create a wrapper for both `<li>` elements, but not the `<ul>` or the `<span>` as those don't have any variable parts. The view then uses these two wrappers to update the `<li>` elements with the person's name and age when they change.

All DOM updates are done via wrappers.

#### Directives

Directives are custom attributes we place in the `__html__` field which tell the plugin what code to generate. They are valid HTML, but get stripped from the final output. There is a list of all the available directives further down, and you can even define your own.

The core directive is called **:watch** and looks like this:

```html
<div :watch="propertyToWatch|converterFunction|wrapperMethod"></div>
```

Directives take arguments separated by the `|` symbol. 

The **:watch** directive accepts 3 arguments:

1. **propertyToWatch** a property somewhere whose value we will watch.
2. **converterFunction** an optional function which converts that value before using it.
3. **wrapperMethod** the method of the wrapper which the value will be passed to.

It essentially watches a field for changes, and calls a method on the wrapper (thereby updating the DOM) if the field's value has changed.



Let's try that out:

```javascript
class MyView extends View {
  __html__ = `
    <div>
      <span :watch=".message|.capitalize?|text"></span>
    </div>
  `
  init() {
    this.message = 'hello';
  }
  capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1) + '!'
  }
}
```

The above translates as:

* Create a *watch* on field `this.message`
* Pass the value to `this.capitalise()`
* Pass the result to `wrapper.text()`

Where `this` is the view instance and `wrapper` is the view's internal wrapper around the `<span>` element.

We'll cover watches in more detail later, for now just think of them as something which remembers the old and new values of a field.

The prefix `.` in front of the first two arguments (`.message` and `.capitalize?`) this tells RedRunner to look on the view instance for those fields. 

The prefixes is as follows:

| Prefix | Example    | Meaning                        |
| ------ | ---------- | ------------------------------ |
| (none) | `message`  | Look on view props.            |
| **.**  | `.message` | Look on view instance.         |
| **..** | `..foo`    | Look in global (module) scope. |

We'll cover props shortly.

The `?` at the end of `.capitalize?` means it should be treated as a function.



| Code                         | Meaning      |
| ---------------------------- | ------------ |
|`:watch="foo|bar?|text"`  | Watch props.foo, pass new & old values to props.bar(), pass result to wrapper.text() |
|`:watch="foo|bar|text"`  | Watch props.foo, but use props.bar, pass to wrapper.text(). |
|`:watch="foo|bar|text"`  | Watch props.foo, but use props.bar, pass to wrapper.text(). |
|`:watch="foo|bar|text"`  | Watch props.foo, but use props.bar, pass to wrapper.text(). |
|`:watch="foo|bar|text"`  | Watch props.foo, but use props.bar, pass to wrapper.text(). |
|`:watch="foo|bar|text"`  | Watch props.foo, but use props.bar, pass to wrapper.text(). |






```html
<div :watch="firstName|..capitalize?|text"></div>
```

The above directive does two things:

* Creates a **watch** against `props.name` 
* Adds a callback to that watch which will update that div if the value changes



The simplest directive is **:as** which looks like this:

```html
<div :as="myDiv"></div>
```

All it does is make the wrapper for that div available for you to work with:

```javascript
class MyView extends View {
  __html__ = `
    <div>
      <div :as="myDiv"></div>
    </div>
  `
  update(props) {
    super.upate(props);
    this.dom.myDiv.text('BOOM');
  }
}
```

As mentioned earlier, you will rarely need to do this as you can achieve most things using directives.

However, the fact you *can* do this if you need to is a real lifeline. It means you can basically step out of the framework and do direct DOM manipulation whenever you please without:

* Having to use ugly JavaScript
* Having to load a separate jQuery-like library
* Worrying about breaking the framework (you can do it inside a view which has framework-controlled elements - try that in React)
* Worrying about scope leak (wrappers belong to the view)

















### Updates

To update a view (i.e. make the DOM change) we call it's `update()` method, which will:

* Update its own DOM based on *directives* (see below).
* Cascades the `update()` call to its nested views.

To start with you will likely update all top level views in response to every data change, which effectively creates one-way data binding throughout the app. Later on you can fine tune it to only update parts that need to be changed for better performance if necessary.

RedRunner has no two-way data binding, as that is simply a terrible idea in the browser.



#### Watches

A watch is an object which reads a value and remembers it, in this case the field `firstName` on the view's props (see below). It also has callback functions it will call if the value is found to have changed since the last update.

Note that these callbacks will only be triggered during the view's `update()` call.




```javascript
class MyView extends View {
  __html__ = `
    <div>
      <div :watch="name|..capitalize|text"></div>
    </div>
  `
}
```






```html
<div>
  <div>{{age}}</div>
  <div>{{name|capitalize}}</div>
</div>
```







### Inline directives (aka bracket syntax)

The simplest way to add dynamic content is with inline directives:

```javascript
class MyView extends View {
  __html__ = `
    <div>
      <span style="color: {{.color}}">
        {{.text|.greet?}}
      </span>
    </div>
  `
  init() {
    this.color = 'red'
    this.name = 'hello redrunner'
  }
  greet(s) {
    return s.charAt(0).toUpperCase() + s.slice(1) + '!'
  }
}
```

An inline directive has one or two slots, separated by `|` which work as follows: 

| Format     | Effect |
| ---------- | ------------ |
| `{{data}}` | If `data` has changed, used in the DOM. |
| `{{data|converter}}` | If `data` has changed, pass new & old value to `converter` and use the return value in the DOM. |

However, the `converter` function:

* Doesn't need to use the new & old value, it can return anything.
* Doesn't need be a function, it can be a field or variable, in which case it is used as-is.

This means you can treat the `data` slot as merely a means to decide whether to update the DOM, and the `converter` as the value that gets inserted into tYou can use __clone__ instead of __html__ to make the view class create a DOM template first, which works better if you have large number of instances.

View methods

The view class has several methods, here are some common ones:he DOM:

```
{{ dataChangeDetect | dataToDisplay }}
```

Either slot can be a field or a function. More on this in the next section.

### Property slot syntax

Inline directives has two slots, both of which are **property slots**, which have a special syntax:

##### ? and ()

The `?` or `()` indicates that the field should be called rather than read:

```html
<div>{{ treatThisAsAValue }}</div>
<div>{{ treatThisAsAFunction? }}</div>
<div>{{ treatThisAsAFunction() }}</div>
```

##### . and ..

Determines where to read the property:

```html
<div>{{ ..moduleScope }}</div>
<div>{{ .view }}</div>
<div>{{ props }}</div>
```

##### * and [blank]

In the watch slot `*` indicates always, and (blank) indicates once:

```html
// This will update the DOM at every update
<div>{{*|name?}}</div>
// This will update the DOM on initial creation only
<div>{{|name?}}</div>
```


### 

#### as

#### on

#### hide

#### inner

#### items

#### show

#### watch

#### wrapper

### Nested Views

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







## Demo

There is currently just one demo app called Smoothies, which you can run like so:

```
cd demo
npm i
npm run start
```

You'll be able to view it from desktop or a mobile device on your network (you'll need to find your machine's IP address).

You can also run these to inspect the output:

```
npm run build
npm run build-dev
```

## Contributing

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

## License

MIT