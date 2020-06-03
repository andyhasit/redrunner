#babel-plugin-redrunner

A babel plugin for RedRunner.

## Overview

This plugin mainly processes the `__html__` definition of RedRunner view classes:

```javascript
class MyView extends View {
  __html__ = '<div :watch="*|name|text"/>'
}
```

The `__html__` property is removed and in its place we define fields on the prototype (we can't replace ES6 with more ES6) which interact with core library code (View & Wrapper).

These fields include:

* A query to determine the new value
* A callback to apply the change to the element
* A method to build the view

And might look something like this:

```javascript
class MyView extends View {}
MyView.prototype.__wq = {
  'name': function () {
    return this.props.name;
  }
};
MyView.prototype.__wc = {
  'name': [function (n, o) {
    this.dom.__1.text(n);
  }]
};
MyView.prototype.__ht = '<div></div>';
MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([])
  };
};
```

The directives are configurable.

## Compatibility

Currently under 0.1.0 so its wild wild west, thereafter you **must** match the major minor to the version of redrunner you are using.

## Tests

Run with:

`npm test`

There is a very simple built in test runner which checks expected output, see **tests/index.js** for more details.

Update snapshots with:

```
jest -u
```



## Extendable API

The plugin works by looking for directives, which are defined in the plugin's source code but can be customised or added to via plugin options:

```
//example of plugin options
```

Where options are provided, they are patched onto the internal config object.

### Directives

```javascript
':visible': {
  args: ['property', 'converter'],
  actions: {
    watch: {
      method: 'visible',
      args: 'n',
    },
    shield: true // Shields nested wrappers from being updated
  }
}
```

#### Args

This specifies the expected arguments, which are separated by the `|` symbol:

```html
<div :foo="arg1|arg2"/>
```

You can provide:

1. A function
2. An array (of function and strings)
3. Nothing

##### Function

A function which receives the string and context, and should return an array or string (or whatever type your action function(s) expect).

```javascript
':foo': {
  args: function (str, ctx) { 
    const parts = s.split('|')
    return [ctx.parseProperty(parts[0]), parts[1]]
  }
}
```

Use this for complex situations e.g. where you allow a variable number of arguments.

##### Array

An array of functions and strings:

```javascript
':foo': {
  args: ['property', foo]
}
```

The functions should process a single argument and return a value. A string indicates a registered argParser (see ArgParsers below).

##### Undefined

If undefined, args will be extracted as a string.

#### Actions

This defines what actions to take when the directive is encountered.

You can provide:

1. A function
2. An object

##### Function

A function which receives the extracted args plus the context, and returns an object with the actions:

```javascript
':foo': {
  actions: function (args, ctx) {
    return {saveAs: args}
  }
}
```

##### Object

An object with a key value pair for each action, where the value can be a function or an object:

```javascript
':foo': {
  actions: {
    watch: {...},
	saveAs: {...},
  }
}
```
There are several actions

| Action | Effect                              | Fields        |
| ------ | ----------------------------------- | ------------- |
| watch  | saves a value watch with a callback | createWrapper |
| chain  | adds a chain call                   |               |
| saveAs |                                     |               |





d


```javascript
nodeInstructions = {
    saveAs: undefined,
    
}



config = {
	argParsers: {
		'property',
		'converter'
	},
	directives: {
	  ':visible': {
	    args: ['property', 'converter'],
	    actions: {
	      watch: {
	      	method: 'visible',
	      	args: 'n',
		  	},
	   	  shield: true // Shields nested wrappers from being updated
	   	}
	  },
	  ':watch': {
	  	args: ['property', 'converter', 'target'],
	  	callbacks: [],
	  }

	}
}
```
