#RedRunner Babel Plugin

The babel plugin for use with RedRunner.

## Installation

Install into your project with:

```
npm i -D babel-plugin-redrunner
```

## Overview

This plugin mainly replaces the `__html__` definition of RedRunner views with fields on the prototype.

This:

```javascript
class MyView extends View {
  __html__ = '<div :watch="*|name|text"/>'
}
```

Becomes something like:

```javascript
MyView.prototype.html = '...';
MyView.prototype.watches = [...];
MyView.prototype.queries = {...};
MyView.prototype.build = function () {...};
```

## Compatibility

You *must* match the minor version to the version of RedRunner you are using.

## Tests

Run with:

`npm test`

## Configuration

### The helper (not working yet)

TBC

### Directives (not configurable yet)

You can override or define your own directives (i.e. the special attributes in `__html__` which get parsed).

```json
{
  "plugins": [
    ["redrunner", {"configFile": "./src/config.js"}]
  ]
}
```

In your **config.js**:

```javascript
module.exports = {
   directives: {
    ':my-dir': {
         params: 'arg1, arg2',
         handle: function(arg1, arg2) {
           this...
       }
    }
  }
}
```

#### Args

This specifies the expected arguments, which are separated by the `|` symbol:

```html
<div :foo="arg1|arg2"/>
```

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
}build
```
