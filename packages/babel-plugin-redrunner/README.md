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

You *must* match the exact version to the version of RedRunner you are using.

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

#### Directive syntax

##### Params

This specifies the expected arguments, which are separated by the `|` symbol:

```html
<div :foo="arg1|arg2"/>
```

##### Handle

There are several actions

| Action          | Effect                              |
| --------------- | ----------------------------------- |
| this.addWatch() | saves a value watch with a callback |
| chain           | adds a chain call                   |
| saveAs          |                                     |



