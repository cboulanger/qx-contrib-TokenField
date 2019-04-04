(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.tabview.Page": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qxl.apiviewer.TreeUtil": {},
      "qx.event.Timer": {},
      "qxl.apiviewer.UiModel": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qxl.apiviewer.ui.tabview.AbstractPage", {
    extend: qx.ui.tabview.Page,
    type: "abstract",

    construct: function construct() {
      qx.ui.tabview.Page.constructor.call(this);

      this.setLayout(new qx.ui.layout.Canvas());
      this.setShowCloseButton(true);

      this._bindings = [];

      this._viewer = this._createViewer();
      // while using edge 0, we need to set the padding to 0 as well [BUG #4688]
      this.add(this._viewer, { edge: 0 });
      this.setPadding(0);

      this.__bindViewer(this._viewer);
    },

    properties: {
      classNode: {
        apply: "_applyClassNode",
        async: true
      }
    },

    members: {
      _viewer: null,

      _bindings: null,

      _createViewer: function _createViewer() {
        throw new Error("Abstract method call!");
      },

      _applyClassNode: function _applyClassNode(value, old) {
        var _this = this;

        return this._viewer.setDocNodeAsync(value).then(function () {
          _this.setLabel(value.getFullName());
          _this.setIcon(qxl.apiviewer.TreeUtil.getIconUrl(value));
          _this.setUserData("nodeName", value.getFullName());

          qx.event.Timer.once(function (e) {
            this._viewer.getContentElement().scrollToY(0);
          }, _this, 0);
        });
      },

      __bindViewer: function __bindViewer(viewer) {
        var uiModel = qxl.apiviewer.UiModel.getInstance();
        var bindings = this._bindings;

        bindings.push(uiModel.bind("showInherited", viewer, "showInherited"));
        bindings.push(uiModel.bind("showIncluded", viewer, "showIncluded"));
        bindings.push(uiModel.bind("expandProperties", viewer, "expandProperties"));
        bindings.push(uiModel.bind("showProtected", viewer, "showProtected"));
        bindings.push(uiModel.bind("showPrivate", viewer, "showPrivate"));
        bindings.push(uiModel.bind("showInternal", viewer, "showInternal"));
      },

      __removeBinding: function __removeBinding() {
        var uiModel = qxl.apiviewer.UiModel.getInstance();
        var bindings = this._bindings;

        while (bindings.length > 0) {
          var id = bindings.pop();
          uiModel.removeBinding(id);
        }
      }
    },

    destruct: function destruct() {
      this.__removeBinding();
      this._viewer.destroy();
      this._viewer = null;
    }
  });
  qxl.apiviewer.ui.tabview.AbstractPage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=AbstractPage.js.map?dt=1554385338814