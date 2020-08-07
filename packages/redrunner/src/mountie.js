/**
 * RedRunner's crude way of tracking mounting and unmounting.
 */

const trackedViews = []

export default {
  track: function (view) {
    trackedViews.push({view: view, isAttached: view.__ia()})
  },
  flush: function () {
    for (let i=0, il=trackedViews.length; i<il; i++) {
      let trackedView = trackedViews[i]
      let view = trackedView.view
      let attachedNow = view.__ia()
      if (attachedNow !== trackedView.isAttached) {
        let fn = attachedNow ? view.mount : view.unmount
        fn.apply(view)
        trackedView.isAttached = attachedNow
      }
    }
  }
}