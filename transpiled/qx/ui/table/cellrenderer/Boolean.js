(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.cellrenderer.AbstractImage": {
        "construct": true,
        "require": true
      },
      "qx.util.AliasManager": {
        "construct": true
      },
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.util.ResourceManager": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qx.ui.table.cellrenderer.Boolean", {
    extend: qx.ui.table.cellrenderer.AbstractImage,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    construct: function construct() {
      qx.ui.table.cellrenderer.AbstractImage.constructor.call(this);

      this.__aliasManager = qx.util.AliasManager.getInstance();

      this.initIconTrue();
      this.initIconFalse();

      // dynamic theme switch
      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
      }
    },

    /*
     *****************************************************************************
       PROPERTIES
     *****************************************************************************
     */

    properties: {
      /**
       * The icon used to indicate the true state
       */
      iconTrue: {
        check: "String",
        init: "decoration/table/boolean-true.png",
        apply: "_applyIconTrue"
      },

      /**
      * The icon used to indicate the false state
      */
      iconFalse: {
        check: "String",
        init: "decoration/table/boolean-false.png",
        apply: "_applyIconFalse"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members: {
      __iconUrlTrue: null,
      __iconUrlFalse: false,
      __aliasManager: null,

      /**
       * Handler for theme changes.
       * @signature function()
       */
      _onChangeTheme: function _onChangeTheme() {
        this._applyIconTrue(this.getIconTrue());
        this._applyIconFalse(this.getIconFalse());
      },

      // property apply
      _applyIconTrue: function _applyIconTrue(value) {
        this.__iconUrlTrue = this.__aliasManager.resolve(value);
      },

      // property apply
      _applyIconFalse: function _applyIconFalse(value) {
        this.__iconUrlFalse = this.__aliasManager.resolve(value);
      },

      // overridden
      _insetY: 5,

      // overridden
      _getCellStyle: function _getCellStyle(cellInfo) {
        return qx.ui.table.cellrenderer.Boolean.prototype._getCellStyle.base.call(this, cellInfo) + ";padding-top:4px;";
      },

      // overridden
      _identifyImage: function _identifyImage(cellInfo) {
        var w;
        var h;
        var rm;
        var id;
        var ids;
        var imageHints;

        // Retrieve the ID
        rm = qx.util.ResourceManager.getInstance();
        ids = rm.getIds(this.__iconUrlTrue);

        // If ID was found, we'll use its first (likely only) element here.
        if (ids) {
          id = ids[0];

          // Get the natural size of the image
          w = rm.getImageWidth(id);
          h = rm.getImageHeight(id);
        }

        // Create the size portion of the hint.
        //
        // The traditional (fixed) size of the image was 11x11px. Use that if we
        // weren't able to retrieve the actual size of the image, and never
        // exceed that size.
        imageHints = {
          imageWidth: w ? Math.min(w, 11) : 11,
          imageHeight: h ? Math.min(h, 11) : 11
        };

        // Add the URL portion of the hint
        switch (cellInfo.value) {
          case true:
            imageHints.url = this.__iconUrlTrue;
            break;

          case false:
            imageHints.url = this.__iconUrlFalse;
            break;

          default:
            imageHints.url = null;
            break;
        }

        return imageHints;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */

    destruct: function destruct() {
      this.__aliasManager = null;
      // remove dynamic theme listener
      {
        qx.theme.manager.Meta.getInstance().removeListener("changeTheme", this._onChangeTheme, this);
      }
    }
  });
  qx.ui.table.cellrenderer.Boolean.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Boolean.js.map?dt=1554385333159