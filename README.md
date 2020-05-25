# RedRunner

A progressive frontend framework.

#### Update May 2020

RedRunner works (experimentally) and looks very promising, but is in alpha mode, so anything could change.

To see how it works, look at the **tests** and **demos** (user guide coming soon).

I've been testing performance using [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) and it measures up pretty well. It is faster than React in almost every test, the bundles are much smaller, and the code looks nicer too. 

I'm yet to raise a PR on there to add RedRunner, just been testing it locally to date.

#### Installation

Use npm:

```
npm install redrunner
```

This will install both **redrunner** and a compatible version of **babel-plugin-redrunner** which is required to process your code. 

You will also need **@babel/plugin-proposal-class-properties** but you ***must*** specify them in this order:

```json
"plugins": [
  ["babel-plugin-redrunner"],
  ["@babel/plugin-proposal-class-properties"]
]
```

#### Demos

The demos require [parcel](https://parceljs.org/) which is best installed globally:

```
npm install -g parcel-bundler
```

You can then run each of the demos in the following way:

```
cd packages/demos
parcel smoothie-maker/index.html
```

#### Tests

Run with:

```
lerna run test
```


#### License

MIT