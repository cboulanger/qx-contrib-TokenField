(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.mobile.container.Composite": {
        "construct": true,
        "require": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qx.bom.Element": {},
      "qx.bom.element.Style": {},
      "qx.bom.element.Location": {},
      "qx.util.DisposeUtil": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qx.ui.mobile.container.Drawer", {
    extend: qx.ui.mobile.container.Composite,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param parent {qx.ui.mobile.container.Composite?null} The widget to which
     * the drawer should be added, if null it is added to app root.
     * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be
     * used for this container.
     */
    construct: function construct(parent, layout) {
      qx.ui.mobile.container.Composite.constructor.call(this);

      if (layout) {
        this.setLayout(layout);
      }

      this.initOrientation();
      this.initPositionZ();

      if (parent) {
        {
          this.assertInstance(parent, qx.ui.mobile.container.Composite);
        }

        parent.add(this);
      } else {
        qx.core.Init.getApplication().getRoot().add(this);
      }

      qx.core.Init.getApplication().addListener("back", this._onBack, this);

      this.__parent = this.getLayoutParent();
      this.__parent.addCssClass("drawer-parent");

      this.__parent.addListener("swipe", this._onParentSwipe, this);
      this.__parent.addListener("pointerdown", this._onParentPointerDown, this);

      this.__pointerStartPosition = [0, 0];

      this.forceHide();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */

    events: {
      /**
       * Fired when the drawer changes its size.
       */
      resize: "qx.event.type.Data"
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
        init: "drawer"
      },

      /** Property for setting the orientation of the drawer.
       * Allowed values are: <code>left</code>,<code>right</code>,<code>top</code>,<code>bottom</code> */
      orientation: {
        check: "String",
        init: "left",
        apply: "_applyOrientation"
      },

      /** The size of the drawer in <code>px</code>. This value is interpreted as width if
      * orientation is <code>left | right</code>, as height if orientation is
      * <code>top | bottom</code>. */
      size: {
        check: "Integer",
        init: 300,
        apply: "_applySize",
        event: "resize"
      },

      /** Indicates whether the drawer should hide when the parent area of it is tapped.  */
      hideOnParentTap: {
        check: "Boolean",
        init: true
      },

      /**
       * Indicates whether the drawer should hide when a back action appear form a key event.
       */
      hideOnBack: {
        check: "Boolean",
        init: true
      },

      /** Sets the size of the tapping area, where the drawer reacts on swipes for opening itself. */
      tapOffset: {
        check: "Integer",
        init: 20
      },

      /** The duration time of the transition between shown/hidden state in ms. */
      transitionDuration: {
        check: "Integer",
        init: 500,
        apply: "_applyTransitionDuration"
      },

      /** Sets the drawer zIndex position relative to its parent. */
      positionZ: {
        check: ["above", "below"],
        init: "above",
        apply: "_applyPositionZ"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __pointerStartPosition: null,
      __parent: null,
      __transitionEnabled: null,
      __inTransition: null,

      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        this.removeCssClass(old);
        this.addCssClass(value);

        // Reapply width of height size depending on orientation.
        this._applySize(this.getSize());
      },

      // property apply
      _applyPositionZ: function _applyPositionZ(value, old) {
        this.removeCssClass(old);
        this.addCssClass(value);

        if (this.__parent) {
          this.__parent.setTranslateX(0);
          this.__parent.setTranslateY(0);
        }
      },

      // property apply
      _applySize: function _applySize(value) {
        var height = null;
        var width = null;

        var remSize = value / 16;

        if (this.getOrientation() == "left" || this.getOrientation() == "right") {
          width = remSize + "rem";
        } else {
          height = remSize + "rem";
        }

        this._setStyle("height", height);
        this._setStyle("width", width);
      },

      // property apply
      _applyTransitionDuration: function _applyTransitionDuration(value, old) {
        this.__transitionEnabled = value > 0;
      },

      /**
       * Shows the drawer.
       */
      show: function show() {
        if (!this.isHidden() || this.__inTransition === true) {
          return;
        }

        this.__inTransition = true;

        // Make drawer visible before "changeVisibility" event is fired, after transition.
        this._setStyle("visibility", "visible");

        this.__parent.addCssClass("blocked");

        if (this.getPositionZ() == "below") {
          if (this.getOrientation() == "left") {
            this.__parent.setTranslateX(this.getSize());
          } else if (this.getOrientation() == "right") {
            this.__parent.setTranslateX(-this.getSize());
          } else if (this.getOrientation() == "top") {
            this.__parent.setTranslateY(this.getSize());
          } else if (this.getOrientation() == "bottom") {
            this.__parent.setTranslateY(-this.getSize());
          }
        }

        if (this.getTransitionDuration() > 0) {
          this._enableTransition();

          var callArguments = arguments;
          var transitionTarget = this._getTransitionTarget().getContentElement();
          var listenerId = qx.bom.Element.addListener(transitionTarget, "transitionEnd", function (evt) {
            qx.ui.mobile.container.Drawer.prototype.show.base.call(this);
            this._disableTransition();
            this.__inTransition = false;
            qx.bom.Element.removeListenerById(transitionTarget, listenerId);
          }, this);

          setTimeout(function () {
            this.removeCssClass("hidden");
          }.bind(this), 0);
        } else {
          qx.ui.mobile.container.Drawer.prototype.show.base.call(this);
          this.__inTransition = false;
          this.removeCssClass("hidden");
        }
      },

      /**
       * Hides the drawer.
       */
      hide: function hide() {
        if (this.isHidden() || this.__inTransition === true) {
          return;
        }

        this.__inTransition = true;

        if (this.getPositionZ() == "below") {
          this.__parent.setTranslateX(0);
          this.__parent.setTranslateY(0);
        }

        if (this.getTransitionDuration() > 0) {
          this._enableTransition();

          var callArguments = arguments;
          var transitionTarget = this._getTransitionTarget().getContentElement();
          var listenerId = qx.bom.Element.addListener(transitionTarget, "transitionEnd", function (evt) {
            qx.ui.mobile.container.Drawer.prototype.hide.base.call(this);
            this._disableTransition();
            this.__parent.removeCssClass("blocked");
            this.__inTransition = false;
            qx.bom.Element.removeListenerById(transitionTarget, listenerId);
          }, this);

          setTimeout(function () {
            this.addCssClass("hidden");
          }.bind(this), 0);
        } else {
          qx.ui.mobile.container.Drawer.prototype.hide.base.call(this);
          this.addCssClass("hidden");
          this.__inTransition = false;
          this.__parent.removeCssClass("blocked");
        }
      },

      /**
       * Strict way to hide this drawer. Removes the blocker from the parent,
       * and hides the drawer without any animation. Should be called when drawer's
       * parent is animated and drawer should hide immediately.
       */
      forceHide: function forceHide() {
        this._disableTransition();

        if (this.getPositionZ() == "below") {
          this.__parent.setTranslateX(0);
          this.__parent.setTranslateY(0);
        }

        this.__parent.removeCssClass("blocked");

        this.addCssClass("hidden");
      },

      // overridden
      isHidden: function isHidden() {
        return this.hasCssClass("hidden");
      },

      /**
       * Enables the transition on this drawer.
       */
      _enableTransition: function _enableTransition() {
        qx.bom.element.Style.set(this._getTransitionTarget().getContentElement(), "transition", "all " + this.getTransitionDuration() + "ms ease-in-out");
      },

      /**
        * Disables the transition on this drawer.
        */
      _disableTransition: function _disableTransition() {
        qx.bom.element.Style.set(this._getTransitionTarget().getContentElement(), "transition", null);
      },

      /**
      * Returns the target widget which is responsible for the transition handling.
      * @return {qx.ui.mobile.core.Widget} the transition target widget.
      */
      _getTransitionTarget: function _getTransitionTarget() {
        if (this.getPositionZ() == "below") {
          return this.__parent;
        } else {
          return this;
        }
      },

      /**
       * Toggle the visibility of the drawer.
       * @return {Boolean} the new visibility state.
       */
      toggleVisibility: function toggleVisibility() {
        if (this.isHidden()) {
          this.show();
          return true;
        } else {
          this.hide();
          return false;
        }
      },

      /**
       * Handles a back event which appears on the application.
       *
       * @param evt {qx.event.type.Data} The back event.
       */
      _onBack: function _onBack(evt) {
        var triggeredByKeyEvent = !!evt.getData();
        if (triggeredByKeyEvent && !this.isHidden() && this.getHideOnBack()) {
          evt.preventDefault();
          this.hide();
        }
      },

      /**
       * Handles a tap on drawers' root.
       * @param evt {qx.module.event.Pointer} Handled pointer event.
       */
      _onParentPointerDown: function _onParentPointerDown(evt) {
        this.__pointerStartPosition = [evt.getViewportLeft(), evt.getViewportTop()];

        var isShown = !this.hasCssClass("hidden");
        if (isShown && this.isHideOnParentTap()) {
          var location = qx.bom.element.Location.get(this.getContainerElement());
          var orientation = this.getOrientation();
          if (orientation == "left" && this.__pointerStartPosition[0] > location.right || orientation == "top" && this.__pointerStartPosition[1] > location.bottom || orientation == "bottom" && this.__pointerStartPosition[1] < location.top || orientation == "right" && this.__pointerStartPosition[0] < location.left) {
            // First event on overlayed page should be ignored.
            evt.preventDefault();

            this.hide();
          }
        }
      },

      /**
       * Handles a swipe on layout parent.
       * @param evt {qx.module.event.Pointer} Handled pointer event.
       */
      _onParentSwipe: function _onParentSwipe(evt) {
        var direction = evt.getDirection();
        var isHidden = this.hasCssClass("hidden");
        if (isHidden) {
          var location = qx.bom.element.Location.get(this.getContainerElement());

          if (direction == "right" && this.getOrientation() == "left" && this.__pointerStartPosition[0] < location.right + this.getTapOffset() && this.__pointerStartPosition[0] > location.right || direction == "left" && this.getOrientation() == "right" && this.__pointerStartPosition[0] > location.left - this.getTapOffset() && this.__pointerStartPosition[0] < location.left || direction == "down" && this.getOrientation() == "top" && this.__pointerStartPosition[1] < this.getTapOffset() + location.bottom && this.__pointerStartPosition[1] > location.bottom || direction == "up" && this.getOrientation() == "bottom" && this.__pointerStartPosition[1] > location.top - this.getTapOffset() && this.__pointerStartPosition[1] < location.top) {
            this.show();
          }
        }
      }
    },

    destruct: function destruct() {
      qx.core.Init.getApplication().removeListener("back", this._onBack, this);

      this.__parent.removeListener("swipe", this._onParentSwipe, this);
      this.__parent.removeListener("pointerdown", this._onParentPointerDown, this);

      qx.util.DisposeUtil.destroyContainer(this);

      this.__pointerStartPosition = this.__parent = this.__transitionEnabled = null;
    }
  });
  qx.ui.mobile.container.Drawer.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Drawer.js.map?dt=1554385330590