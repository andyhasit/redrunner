# RedRunner

*A JavaScript framework with legs!*

> Update April 2022:
>
> I've been using this framework on personal projects for a while and refining it as I go.
>
> It performs a lot better than React, is about 1/10th the size, and has a lot of cool features too.
>
> I'll soon be doing a proper release in the next month or two, so come back then.

### About this repo

This is a mono-repo which includes the following npm packages:

1. [redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner)
2. [redrunner-router](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner-router)
3. [babel-plugin-redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/babel-plugin-redrunner)

You are probably looking for [redrunner](https://github.com/andyhasit/redrunner/tree/develop/packages/redrunner), the rest of this README is aimed at contibutors.

### Installing the monorepo

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

Note that the canary app is deliberately not a lerna package, and must be installed separately. See its [README](./canary/README.md) for more details.

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

##### Canary app

Use the canary app to ensure RedRunner works when installed normally.

##### Useful commands

```
lerna bootstrap
lerna publish
```

### License

MIT