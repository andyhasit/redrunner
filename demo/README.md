# RedRunner Demo

This directory contains ***Smoothie Maker*** - a working demo of RedRunner which includes:

* A router
* A webpack config (may add parcel?)
* CSS assets
* A showcase of most of the features of RedRunner.

You can use this as a starting point for your own project.

### Running:

First install the node modules:

```
npm i
```

Then run the webpack-dev-server:

```
npm run start
```

Then got to http://localhost:8080 if webpack doesn't do it for you.

### Dev notes:

This demo also serves as a way of checking the configuration files of the various packages work correctly.

It is purposefully not a packages itself. This is to prevent Lerna from creating symlinks in its node_modules, as certain bundlers (notably parcel) treat symlinks differently, which can hide configuration errors.

Use the `copy*` scripts in package.json to update instead.

