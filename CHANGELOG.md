# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Note that the major version is currently **0** meaning *anything* may change at any time.

### [0.10.0] - 2020-12-11

#### Changed:

* (Breaking) no longer pass parent props by default.

### [0.10.0] - 2020-12-11

#### Added:

* Offline help system
* `View.__ex__` allows prototype as second argument.
* Wrapper `getAtt` and `isChecked`

#### Changed

* `mount()` no longer requires or accepts `#` on id string.
* `:items`  no longer accepts a watch value, so is now `<div :items="todos|ToDo">`

#### Fixed

* Using `:` in a watch, like `<div :watch="||style:color">`

### [0.9.0] - 2020-12-03

#### Changed

*Major breaking changes!*

* You can/must now specify what arguments your callbacks should receive.
* Removed `.` and `?` suffixes (every value slot is a field unless it has brackets)
* Flipped the meaning of prefixes:
  * `..name` means `props.name` (previously module scope)
  * `.name` means `component.name` (no change)
  * `name` (no prefix) means `name` in module scope (previously props) 

#### Added

* You can now have inline directives in text which are not leaf nodes.
* You can now have multiple inline directives in the same text.
* You can use `View.__ex__` instead of classes.

These changes allow for a much more functional approach to designing components. We are also transitioning from calling them views to components.

### [0.8.6] - 2020-11-28

#### Changed

* Props now called with (component) if it is a function.
* Event args called with (wrapper, event, props, component)

### [0.8.5] - 2020-11-27

#### Changed

* Callable watched fields now called with (props, component) 

### [0.8.4] - 2020-11-24

#### Fixed

* Fixed issue with setting value on wrapper

### [0.8.3] - 2020-11-23

#### Fixed

* Fixed issue with whitespace being stripped from HTML

### [0.8.1] - 2020-11-14

#### Fixed

* Set visibility on views (missing functionality)
* Refactored caches to improve performance

### [0.8.0] - 2020-11-10

#### Added

* :swap directive + instance cache
* Can place JS expressions inside directive converters

### [0.7.0] - 2020-11-07

#### Changed

* Inline delimiters now configurable and default to single curly braces.
* Directive `:as` is now called `:el`
* `view.dom` is now `view.el` 

#### Fixed

* Removed a spoiled child from oval office.

### [0.6.3] - 2020-11-02

#### Fixed

- Bubble now starts at parent, not self.

### [0.6.2] - 2020-11-02

#### Added

- Stubs automatically saved as their own name (e.g.`this.dom.inner`) enabling access to saved elements from parent view (e.g. `this.dom.inner.dom.form`)

### [0.6.1] - 2020-11-02

#### Added

- The bubble() method throws an error if it doesn't find a method.

#### Fixed

- Items added via `wrapper.items()` did not have parent set.

### [0.6.0] - 2020-11-01

#### Added

- The bubble() method.

#### Changed

- `h` no longer accepts second argument.
- Views automatically gets parent props

### [0.5.0] - 2020-10-29

#### Changed

- Nested class declarations are now `<use:ChildViewClass>` rather than uppercase convention: `<ChildViewClass ... >`
- Feature allowing you to place declarations inside a `views.html` file is currently disabled.
- Dropped [node-html-parser](https://github.com/taoqf/node-html-parser) and now use only [jsdom](https://github.com/jsdom/jsdom) for parsing HTML.

#### Fixed

- Horrible bug which injected the entire contents of "he" (npm packge) into bundles, because of node-html-parser.

### [0.4.5] - 2020-10-27

#### Fixed

- Issue in nested views

### [0.4.4] - 2020-10-27

#### Fixed

- Bug with specifying props as function

### [0.4.2] - 2020-10-22

#### Fixed

- Issue with stubs constructor prototype

### [0.4.1] - 2020-10-21

#### Fixed

- Class properties were being removed from views which define \_\_html\_\_ or \_\_stubs\_\_.

### [0.4.0] - 2020-10-21

#### Added

- Stubs
- :replace

### [0.3.3] - 2020-10-18

#### Changed

- Froze node-html-parser @ 1.2.20 in babel plugin because 1.2.21 has major breaking change

### [0.3.2] - 2020-10-18

Botched release.

### [0.3.1] - 2020-08-18

#### Changed

- wrapper.visible now sets class hidden


## [0.3.0] - 2020-07-24

Major rewrite. Ignore anything before this.

