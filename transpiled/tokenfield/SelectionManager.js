(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.selection.Widget": {
        "require": true
      },
      "qx.ui.core.selection.Abstract": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("tokenfield.SelectionManager", {
    extend: qx.ui.core.selection.Widget,
    members: {
      handleKeyPress: function handleKeyPress(event) {
        var key = event.getKeyIdentifier();
        if (key != "Left" && key != "Right" && key != "Up" && key != "Down") {
          qx.ui.core.selection.Abstract.prototype.handleKeyPress.apply(this, [event]); // this.base(arguments);
        }
      }
    }
  });
  tokenfield.SelectionManager.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=SelectionManager.js.map?dt=1554385338305