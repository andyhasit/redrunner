# RedRunner

This mono-repo includes the following packages:

1. [redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner)
2. [redrunner-router](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner-router)
3. [babel-plugin-redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/babel-plugin-redrunner)

You are probably looking for [redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner).

### Installation

*Note: these instructions are for the monorepo, for contributors. If you simply want to use RedRunner, see [redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner).*

##### Install Lerna

This is mono repo is managed with [lerna](https://lerna.js.org/), which you should install globally:

```
npm install -g lerna
```

##### Clone

```
git clone git@github.com:andyhasit/redrunner.git
```

##### Bootstrap the packages

Install all the packages and their dependencies, linking any cross-dependencies.

```
lerna bootstrap
```

Note that the demo is not a package, and must be installed separately.

##### Install the demo

There is a minimal demo app, which you can run like so:

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

The demo was deliberately *not* made into a lerna package because bundlers often treat symlinked modules differently. That could result in a configuration working fine for the demo, but not in a real world project.

There are is a scripts for copying changes to packages made during development:

```
./copy-local-packages.sh
```

But if you want to set up symlinks on your system, go ahead.

### Contributing

##### Running Tests

Run with:

```
lerna run test
```

Alternatively you can cd into each package and run just the tests for the package:

```
cd packages/redrunner
npm test
```

##### Use the demo

Use the demo as validation in addition to unit tests. New features should be included in the demo.

##### Tooling

This repo uses [lerna](https://lerna.js.org/). Useful commands:

```
lerna bootstrap
lerna publish
```

### License

MIT