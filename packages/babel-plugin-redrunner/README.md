#RedRunner Babel Plugin

This is the babel plugin for RedRunner.

## Usage

#### Installation

Install into your project with:

```
npm i -D babel-plugin-redrunner
```

You must match the minor version to the version of RedRunner you are using, so this would be OK for example:

```javascript
{ 
  "devDependencies": {
    "babel-plugin-redrunner": "~0.6.2"
    "redrunner": "~0.6.4"
  }
}
```

#### Configuration

You can configure various options, and define your own directives, by creating a file called **redrunner.config.js** and the root directory of your project:

```javascript
module.exports = {
  options: {
    inlineDelimiters: ['{%', '%}']
  },
  directives: {
    ':as': {
      handle: function(arg) {
        this.saveAs = arg
      }
    }
  }
}
```

This feature hasn't been developed much yet, nor documented beyond what you are about to read. 

##### Basic How To

Look at the base config file in **lib/redrunner/config.js** to see how other directives have been specified. 

The `handle()` function takes whatever args you specify in the directive, and `this` is bound to the NodeData object of the current node (see **lib/redrunner/node_data.js**, which has all the methods you might want to use. My recommendation is to only do what you see other directives doing.

RedRunner is currently in alpha stage, and minor versions may break things.

## Developer Notes

The code is pretty awful, inconsistent, messy, and could do with a big re-write. Enjoy!

#### Plugin development

The [plugin-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) is pretty much the only guide available on writing babel plugins to date.

#### Tests

Run tests with:

`npm test`

These are just basic tests to help build the plugin TDD style, and you will probably find them outdated. To really test the plugin, run the tests in the package for redrunner itself.

