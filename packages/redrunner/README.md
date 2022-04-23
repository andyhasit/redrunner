# RedRunner

*A JavaScript framework with legs!*

## Overview

RedRunner is a JavaScript framework for building dynamic pages and apps.

It is in early development and not ready to use.

## Installation

#### Quick start

It's easiest to copy the **canary** app from the [monorepo](https://github.com/andyhasit/redrunner/tree/develop/canary) and adapt that.

Alternatively follow the rest of these instructions.

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

The babel plugin replaces each component's `__html__` field with generated code, and debugging is a lot easier if you can see that generated code.

With webpack you can set the config's `devtools` to something like `'eval-cheap-source-map'` which makes the source maps show the *transformed* code, but preserves the module separation which is nice. However this will include *all* transformations, so if you're transpiling to ES5 (which you probably do using a preset) then it will make it harder to track your own code.

One solution is not transpile to ES5 during development, meaning the only transformations you'll see are RedRunner's, which makes debugging a lot nicer.

The canary app's [webpack.config.js](https://github.com/andyhasit/redrunner/tree/canary/webpack.config.js) file shows one way to achieve this. 

You can read more about webpack's devtools option [here](https://webpack.js.org/configuration/devtool/).

## User Guide

This is coming, in the meantime you can check out the canary app and unit tests.

## Contributing

Contributions welcome, see the [main repo](https://github.com/andyhasit/redrunner).

## License

MIT