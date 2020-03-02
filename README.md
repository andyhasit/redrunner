# RedRunner

A simple UI framework.

## 1. Development

There are no unit tests yet, so develop using the demos.

### Demos

Run demos individually with parcel:

```bash
cd demos
parcel click_counter/index.html
```

The demos use relative imports to **src** and have no external dependencies/

### Build

Use [microbundle](https://github.com/developit/microbundle) to build to **dist**:

```
npm run build
```

## 2. Design thinking

### General

The end goal is to display the correct DOM (efficiently). This means building up the initial DOM, and then changing it in response to events. One option for doing this is to have an auto-changing mechanism we can easily plug into.

We are working with DOM. It is nice to write DOM in HTML. But it's also 



##### Mounting

Could do `app.mount()` or more generic `mount` or both. Could replace the element or add a child. I think it needs to replace.





