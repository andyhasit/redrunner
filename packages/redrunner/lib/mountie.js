"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * RedRunner's crude way of tracking mounting and unmounting.
 */
var c = console;
var trackedViews = [];
c.log(999);
var _default = {
  track: function track(view) {
    trackedViews.push({
      view: view,
      isAttached: view.__ia()
    });
  },
  flush: function flush() {
    c.log(trackedViews);

    for (var i = 0, il = trackedViews.length; i < il; i++) {
      var trackedView = trackedViews[i];
      var view = trackedView.view;

      var attachedNow = view.__ia();

      if (attachedNow !== trackedView.isAttached) {
        c.log(attachedNow);
        c.log(trackedView);
        var fn = attachedNow ? view.mount : view.unmount;
        fn.apply(view);
        trackedView.isAttached = attachedNow;
      }
    }
  }
};
exports["default"] = _default;