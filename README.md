# RedRunner

A tiny framework with legs.

## About

RedRunner is a tiny, fast and productive front end JavaScript framework where you can:

* Use expressive template tags, like Angular.
* Compose your app using components defined as classes, like React.
* Enjoy lightening fast performance resulting from compiled code without a virtual DOM, like Svelte.

Out of the box RedRunner is extremely fast, and you can do most things very intuitively. It also has a trump card: you can **progressively trade expressiveness for control**. 

At 1.7kb gzipped, RedRunner is also one of the smallest frameworks around.

## Installation

Its not ready to use yet! Wait till version 0.1.0 (Planned end of May 2020).

### Development

There are no unit tests yet, so develop using the demos.

#### Demos

Run demos individually with parcel:

```bash
parcel demos/click_counter/index.html
```

The demos use relative imports to **src** and have no external dependencies.

#### Build

Use [microbundle](https://github.com/developit/microbundle) to build to **dist**:

```
npm run build
```


#### LICENSE

MIT