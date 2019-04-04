(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.mobile.form.Input": {
        "construct": true,
        "require": true
      },
      "qx.ui.mobile.form.MValue": {
        "require": true
      },
      "qx.ui.mobile.form.MText": {
        "require": true
      },
      "qx.ui.form.IStringForm": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qx.ui.mobile.form.TextField", {
    extend: qx.ui.mobile.form.Input,
    include: [qx.ui.mobile.form.MValue, qx.ui.mobile.form.MText],
    implement: [qx.ui.form.IStringForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param value {var?null} The value of the widget.
     */
    construct: function construct(value) {
      qx.ui.mobile.form.Input.constructor.call(this);

      this.addListener("keypress", this._onKeyPress, this);

      if (qx.core.Environment.get("os.name") == "ios") {
        // IOS does not blur input fields automatically if a parent DOM element
        // was set invisible, so blur manually on disappear
        this.addListener("disappear", this.blur, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */

    properties: {
      // overridden
      defaultCssClass: {
        refine: true,
        init: "text-field"
      }
    },

    members: {
      // overridden
      _getType: function _getType() {
        return "text";
      },

      /**
      * Event handler for <code>keypress</code> event.
      * @param evt {qx.event.type.KeySequence} the keypress event.
      */
      _onKeyPress: function _onKeyPress(evt) {
        // On return
        if (evt.getKeyCode() == 13) {
          this.blur();
        }
      }
    },

    destruct: function destruct() {
      this.removeListener("keypress", this._onKeyPress, this);

      if (qx.core.Environment.get("os.name") == "ios") {
        this.removeListener("disappear", this.blur, this);
      }
    }
  });
  qx.ui.mobile.form.TextField.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=TextField.js.map?dt=1554385331632