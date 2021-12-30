# RedRunner

*A small JavaScript framework with legs.*

## Overview

RedRunner is a JavaScript framework for building dynamic pages and apps.

It is in early development and not ready to use.

## Demo

There is a very minimal demo app, which you can run like so:

```
git clone git@github.com:andyhasit/redrunner.git
cd redrunner/demo
npm i
npm run start
```

You can also inspect the bundle size:

```
npm run build-prod
gzip dist/main.js
ls -lh dist
```

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

I recommend using [webpack](https://webpack.js.org/) instead of alternatives as it gives you better control over source maps, which really helps for development.

#### Source maps

The babel plugin replaces each component's `__html__` field with generated code, and debugging is a lot easier if you can see that generated code.

With webpack you can set the config's `devtools` to something like `'eval-cheap-source-map'` which makes the source maps show the *transformed* code, but preserves the module separation which is nice. However this will include *all* transformations, so if you're transpiling to ES5 (which you probably do using a preset) then it will make it harder to track your own code.

One solution is not transpile to ES5 during development, meaning the only transformations you'll see are RedRunner's, which makes debugging a lot nicer.

The [demo's webpack.config.js](https://github.com/andyhasit/redrunner/tree/demo/webpack.config.js) file shows one way to achieve this. 

You can read more about webpack's devtools option [here](https://webpack.js.org/configuration/devtool/).

## User Guide

This is coming, but so is Christmas.

## Contributing

Contributions welcome, see the [main repo](https://github.com/andyhasit/redrunner).

## License

MIT